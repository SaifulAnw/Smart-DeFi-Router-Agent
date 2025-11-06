// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ==================== IMPORTS ====================
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
}

// Adapter interface (ArcProtocolAdapter)
interface IAdapter {
    function deposit(uint256 amount, bytes calldata data) external returns (bool);
    function withdraw(uint256 amount, bytes calldata data) external returns (bool);
}

// ReentrancyGuard
abstract contract ReentrancyGuard {
    uint256 private constant _ENTERED = 1;
    uint256 private constant _NOT_ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;
    modifier nonReentrant() {
        require(_status != _ENTERED, "REENTRANCY");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

contract RouterAgentV2 is ReentrancyGuard {
    // ==================== STATE ====================
    IERC20 public immutable USDC;
    address public keeperAddress;
    address public owner;

    mapping(address => uint256) public userBalances;        // USDC user managed by the router
    mapping(address => uint8)    public userCurrentProtocol; // active adapter ID per user
    mapping(uint8 => address)    public protocols;          // ID → adapter address

    // ==================== EVENTS ====================
    event Deposited(address indexed user, uint256 amount, uint8 protocolId);
    event Withdrawn(address indexed user, uint256 amount, uint8 protocolId);
    event Rebalanced(address indexed user, uint8 fromId, uint8 toId, uint256 amount);
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event ProtocolUpdated(uint8 indexed id, address indexed oldAddr, address indexed newAddr);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

    // ==================== MODIFIERS ====================
    modifier onlyKeeper() { require(msg.sender == keeperAddress, "NOT_KEEPER"); _; }
    modifier onlyOwner()  { require(msg.sender == owner, "NOT_OWNER"); _; }

    // ==================== CTOR ====================
    constructor(address _usdc, address _initialKeeper, address _owner) {
        require(_usdc != address(0), "USDC_0");
        require(_initialKeeper != address(0), "KEEPER_0");
        require(_owner != address(0), "OWNER_0");
        USDC = IERC20(_usdc);
        keeperAddress = _initialKeeper;
        owner = _owner;
        emit KeeperUpdated(address(0), _initialKeeper);
        emit OwnerUpdated(address(0), _owner);
    }

    // ==================== ADMIN ====================
    function setKeeper(address _keeper) external onlyOwner {
        require(_keeper != address(0), "KEEPER_0");
        emit KeeperUpdated(keeperAddress, _keeper);
        keeperAddress = _keeper;
    }

    function setProtocol(uint8 id, address adapter) external onlyOwner {
        require(id != 0, "ID_0");
        require(adapter != address(0), "ADDR_0");
        emit ProtocolUpdated(id, protocols[id], adapter);
        protocols[id] = adapter; // <- simpan ALAMAT ADAPTER (bukan vault)
    }

    // ==================== USER I/O ====================

    // Deposit USDC into the contract - PULL MODEL
    function depositUsdc(uint256 amount) external nonReentrant {
        require(amount > 0, "AMOUNT_0");

        // 1) tarik USDC dari user → router
        require(USDC.transferFrom(msg.sender, address(this), amount), "XFER_FROM_FAIL");

        // 2) pembukuan user
        userBalances[msg.sender] += amount;

        // 3) pilih adapter tujuan (pakai id aktif user; kalau belum ada, default ke id=1)
        uint8 pid = userCurrentProtocol[msg.sender];
        address adapter;
        if (pid == 0) {
            // Default ke protocol ID = 1
            adapter = protocols[1];
            require(adapter != address(0), "PROTO1_0");
            userCurrentProtocol[msg.sender] = 1;
            pid = 1;
        } else {
            adapter = _getProtocolAdapter(pid);
        }

        // 4) beri izin adapter menarik dari router (clear→set untuk kompatibilitas USDC/USDT)
        require(USDC.approve(adapter, 0), "APPROVE0_FAIL");
        require(USDC.approve(adapter, amount), "APPROVE_FAIL");

        // 5) minta adapter narik USDC dari router
        bool ok = IAdapter(adapter).deposit(amount, "");
        require(ok, "ADAPTER_DEPOSIT_FAIL");

        emit Deposited(msg.sender, amount, pid);
    }

    // Withdraw USDC from the contract
    function withdrawUsdc(uint256 amount) external nonReentrant {
        require(amount > 0, "AMOUNT_0");
        uint256 bal = userBalances[msg.sender];
        require(bal >= amount, "INSUFFICIENT");

        // 1) update user balance first (CEI)
        userBalances[msg.sender] = bal - amount;

        // 2) get active adapter for user
        uint8 pid = userCurrentProtocol[msg.sender];
        address adapter = _getProtocolAdapter(pid);

        // 3) minta adapter kirim balik USDC → router
        bool ok = IAdapter(adapter).withdraw(amount, "");
        require(ok, "ADAPTER_WITHDRAW_FAIL");

        // 4) teruskan ke user
        require(USDC.transfer(msg.sender, amount), "XFER_FAIL");

        // Reset protocol jika balance habis
        if (userBalances[msg.sender] == 0) {
            userCurrentProtocol[msg.sender] = 0;
        }

        emit Withdrawn(msg.sender, amount, pid);
    }

    // ==================== KEEPER ====================
    function executeRebalance(address user, uint8 newProtocolId)
        external
        onlyKeeper
        nonReentrant
    {
        require(user != address(0), "USER_0");
        uint256 bal = userBalances[user];
        require(bal > 0, "NO_FUNDS");

        uint8 curId = userCurrentProtocol[user];
        require(curId != newProtocolId, "SAME_PROTOCOL");

        address fromAdapter = _getProtocolAdapter(curId);
        address toAdapter   = _getProtocolAdapter(newProtocolId);

        // 1) tarik semua funds dari adapter lama → router
        bool okW = IAdapter(fromAdapter).withdraw(bal, "");
        require(okW, "ADAPTER_WITHDRAW_FAIL");

        // 2) approve adapter baru (clear→set)
        require(USDC.approve(toAdapter, 0), "APPROVE0_FAIL");
        require(USDC.approve(toAdapter, bal), "APPROVE_FAIL");

        // 3) deposit ke adapter baru
        bool okD = IAdapter(toAdapter).deposit(bal, "");
        require(okD, "ADAPTER_DEPOSIT_FAIL");

        userCurrentProtocol[user] = newProtocolId;
        emit Rebalanced(user, curId, newProtocolId, bal);
    }

    // ==================== INTERNAL ====================
    function _getProtocolAdapter(uint8 id) internal view returns (address a) {
        a = protocols[id];
        require(a != address(0), "PROTO_0");
    }

    // ==================== SAFETY ====================
    receive() external payable { revert("NO_ETH"); }

        return (shares * totalAssets) / totalShares;
        
        // If no shares, balance is zero
        return 0;
}