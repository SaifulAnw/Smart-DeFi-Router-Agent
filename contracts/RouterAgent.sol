// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ====================================================================
// INTERFACES
// ====================================================================

// Minimal ERC20 interface for USDC interaction
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Interface for mock lending protocols (Protocol A, B, etc.)
interface IMockLendingProtocol {
    function deposit(address user, uint256 amount) external;
    function withdraw(address user, uint256 amount) external;
}

// Simple ReentrancyGuard (prevents reentrancy attacks)
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

// ====================================================================
// MAIN CONTRACT
// ====================================================================

contract RouterAgentV2 is ReentrancyGuard {
    // ====================================================================
    // 1. STATE VARIABLES & ACCESS CONTROL
    // ====================================================================

    IERC20 public immutable USDC;          // USDC token used
    address public keeperAddress;          // keeper address (AI backend)
    address public owner;                  // main admin (contract owner)

    // Stores user balances managed by RouterAgent
    mapping(address => uint256) public userBalances;

    // Stores protocol ID where user funds are currently staked
    mapping(address => uint8) public userCurrentProtocol;

    // Stores list of allowed protocols (id → address)
    mapping(uint8 => address) public protocols;

    // ====================================================================
    // 2. EVENTS
    // ====================================================================

    event Deposited(address indexed user, uint256 amount, uint8 protocolId);
    event Withdrawn(address indexed user, uint256 amount, uint8 protocolId);
    event Rebalanced(address indexed user, uint8 fromId, uint8 toId, uint256 amount);
    event KeeperUpdated(address indexed oldKeeper, address indexed newKeeper);
    event ProtocolUpdated(uint8 indexed id, address indexed oldAddr, address indexed newAddr);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

    // ====================================================================
    // 3. MODIFIERS
    // ====================================================================

    // Only registered keeper can execute certain functions
    modifier onlyKeeper() {
        require(msg.sender == keeperAddress, "NOT_KEEPER");
        _;
    }

    // Only contract owner can change important configurations
    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    // ====================================================================
    // 4. CONSTRUCTOR
    // ====================================================================

    constructor(address _usdc, address _initialKeeper, address _owner) {
        // Validate required inputs
        require(_usdc != address(0), "USDC_0");
        require(_initialKeeper != address(0), "KEEPER_0");
        require(_owner != address(0), "OWNER_0");

        // Initialize variables
        USDC = IERC20(_usdc);
        keeperAddress = _initialKeeper;
        owner = _owner;

        // Emit initial setup events
        emit KeeperUpdated(address(0), _initialKeeper);
        emit OwnerUpdated(address(0), _owner);
    }

    // ====================================================================
    // 5. OWNER FUNCTIONS (CONTRACT MANAGEMENT)
    // ====================================================================

    // Update keeper address
    function setKeeper(address _keeper) external onlyOwner {
        require(_keeper != address(0), "KEEPER_0");
        emit KeeperUpdated(keeperAddress, _keeper);
        keeperAddress = _keeper;
    }

    // Register or update a new protocol
    function setProtocol(uint8 id, address addr) external onlyOwner {
        require(id != 0, "ID_0");
        require(addr != address(0), "ADDR_0");
        emit ProtocolUpdated(id, protocols[id], addr);
        protocols[id] = addr;
    }

    // ====================================================================
    // 6. USER FUNCTIONS (DEPOSIT & WITHDRAW)
    // ====================================================================

    // Deposit USDC from user to RouterAgent, then forward to protocol
    function depositUSDC(uint256 amount) external nonReentrant {
        require(amount > 0, "AMOUNT_0");

        // 1. Transfer USDC from user to contract
        require(USDC.transferFrom(msg.sender, address(this), amount), "XFER_FROM_FAIL");

        // 2. Add amount to user balance mapping
        userBalances[msg.sender] += amount;

        // 3. Determine where funds will be sent (new or existing protocol)
        uint8 cur = userCurrentProtocol[msg.sender];
        if (cur == 0) {
            // If new user, default to protocol id = 1
            require(protocols[1] != address(0), "PROTO1_0");
            IMockLendingProtocol(protocols[1]).deposit(msg.sender, amount);
            userCurrentProtocol[msg.sender] = 1;
            emit Deposited(msg.sender, amount, 1);
        } else {
            // If already has active protocol, add there
            address p = _getProtocolAddress(cur);
            IMockLendingProtocol(p).deposit(msg.sender, amount);
            emit Deposited(msg.sender, amount, cur);
        }
    }

    // Withdraw USDC from protocol to user
    function withdrawUSDC(uint256 amount) external nonReentrant {
        require(amount > 0, "AMOUNT_0");
        require(userBalances[msg.sender] >= amount, "INSUFFICIENT");

        // 1. Reduce user balance
        userBalances[msg.sender] -= amount;

        // 2. Get protocol id & address where user funds are located
        uint8 curId = userCurrentProtocol[msg.sender];
        address cur = _getProtocolAddress(curId);

        // 3. Request protocol to withdraw funds back to RouterAgent
        IMockLendingProtocol(cur).withdraw(msg.sender, amount);

        // 4. Transfer USDC to user
        require(USDC.transfer(msg.sender, amount), "XFER_FAIL");

        // 5. If user balance is 0, reset their protocol
        if (userBalances[msg.sender] == 0) {
            userCurrentProtocol[msg.sender] = 0;
        }

        // 6. Record event
        emit Withdrawn(msg.sender, amount, curId);
    }

    // ====================================================================
    // 7. KEEPER FUNCTION (AI CONTROLLED REBALANCING)
    // ====================================================================

    // Core function to move funds between protocols (called by AI keeper)
    function executeRebalance(address user, uint8 newProtocolId)
        external
        onlyKeeper
        nonReentrant
    {
        // 1. Basic validation
        require(user != address(0), "USER_0");
        uint256 bal = userBalances[user];
        require(bal > 0, "NO_FUNDS");

        // 2. Check old & new protocol
        uint8 curId = userCurrentProtocol[user];
        require(curId != newProtocolId, "SAME_PROTOCOL");

        // 3. Get old and new protocol addresses
        address fromP = _getProtocolAddress(curId);
        address toP = _getProtocolAddress(newProtocolId);

        // 4. Withdraw all funds from old protocol (to RouterAgent)
        IMockLendingProtocol(fromP).withdraw(user, bal);

        // 5. Deposit all funds to new protocol
        IMockLendingProtocol(toP).deposit(user, bal);

        // 6. Update user state mapping
        userCurrentProtocol[user] = newProtocolId;

        // 7. Emit event for transparency
        emit Rebalanced(user, curId, newProtocolId, bal);
    }

    // ====================================================================
    // 8. INTERNAL HELPER
    // ====================================================================

    // Helper function to get protocol address from ID
    function _getProtocolAddress(uint8 id) internal view returns (address) {
        address p = protocols[id];
        require(p != address(0), "PROTO_0");
        return p;
    }

    // ====================================================================
    // 9. SAFETY
    // ====================================================================

    // Reject direct ETH transfers (Arc uses USDC as gas)
    receive() external payable {
        revert("RouterAgent: Cannot receive ETH directly");
    }
}