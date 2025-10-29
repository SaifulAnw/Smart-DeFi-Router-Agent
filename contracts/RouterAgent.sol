// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ====================================================================
// INTERFACES
// ====================================================================

// Standard ERC20 Interface for USDC interaction
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// Interface for the simulated DeFi Protocols (Protocol A and B)
interface IMockLendingProtocol {
    function deposit(address user, uint256 amount) external;
    function withdraw(address user, uint256 amount) external;
}


contract RouterAgent {
    // ====================================================================
    // 1. STATE VARIABLES & SECURITY SETUP
    // ====================================================================

    IERC20 public immutable USDC;
    address public keeperAddress;

    // Maps user address to their total USDC balance managed by the agent
    mapping(address => uint256) public userBalances;

    // Maps user address to the ID of the protocol where their funds are currently staked
    // (1 = Protocol A, 2 = Protocol B, 0 = Not staked)
    mapping(address => uint8) public userCurrentProtocol;
    
    // Addresses of the protocols the agent can route to
    address public protocolA;
    address public protocolB;

    // Modifier: Only the registered keeper (AI Backend) can execute
    modifier onlyKeeper() {
        require(msg.sender == keeperAddress, "RouterAgent: Caller is not the registered keeper");
        _;
    }

    // ====================================================================
    // 2. CONSTRUCTOR
    // ====================================================================

    constructor(address _usdcAddress, address _initialKeeper, address _protocolA, address _protocolB) {
        USDC = IERC20(_usdcAddress);
        keeperAddress = _initialKeeper;
        protocolA = _protocolA;
        protocolB = _protocolB;
        // The Keeper address will typically be a multi-sig or a dedicated smart contract
    }

    // ====================================================================
    // 3. USER FACING FUNCTIONS
    // ====================================================================

    function depositUSDC(uint256 amount) public {
        require(amount > 0, "RouterAgent: Deposit amount must be greater than 0");
        
        // 1. Transfer USDC from user to RouterAgent contract
        require(USDC.transferFrom(msg.sender, address(this), amount), "RouterAgent: USDC transfer failed");
        
        // 2. Update user's recorded balance
        userBalances[msg.sender] += amount;

        // 3. If the user is new or not staked, route the initial deposit (to Protocol A by default)
        if (userCurrentProtocol[msg.sender] == 0) {
            _routeInitialDeposit(msg.sender, amount);
        } else {
            // For simplicity in MVP, assume new deposit goes to the current protocol
            _routeToProtocol(userCurrentProtocol[msg.sender], amount);
        }
    }

    function withdrawUSDC(uint256 amount) public {
        require(amount > 0, "RouterAgent: Withdraw amount must be greater than 0");
        require(userBalances[msg.sender] >= amount, "RouterAgent: Insufficient balance");

        // 1. Update user balance state
        userBalances[msg.sender] -= amount;

        // 2. Internally withdraw the amount from the current staked protocol
        uint8 currentId = userCurrentProtocol[msg.sender];
        address currentProtocol = _getProtocolAddress(currentId);
        
        // The protocol withdraws from its internal state and sends the USDC back to RouterAgent
        IMockLendingProtocol(currentProtocol).withdraw(msg.sender, amount); 
        
        // 3. Transfer USDC from RouterAgent to the user
        require(USDC.transfer(msg.sender, amount), "RouterAgent: Final USDC transfer failed");
        
        // Note: For simplicity, userCurrentProtocol is only set to 0 when balance hits zero.
        if (userBalances[msg.sender] == 0) {
            userCurrentProtocol[msg.sender] = 0;
        }
    }


    // ====================================================================
    // 4. KEEPER/AI EXECUTION FUNCTION (CORE REBALANCING LOGIC)
    // ====================================================================

    function executeRebalance(address user, uint8 newProtocolId) external onlyKeeper {
        uint256 balance = userBalances[user];
        require(balance > 0, "RouterAgent: User has no funds to rebalance");
        
        uint8 currentProtocolId = userCurrentProtocol[user];
        require(currentProtocolId != newProtocolId, "RouterAgent: Already in target protocol");

        // 1. Get current and target protocol addresses
        address currentProtocol = _getProtocolAddress(currentProtocolId);
        address targetProtocol = _getProtocolAddress(newProtocolId);

        // 2. WITHDRAW: Pull all funds from the current protocol
        // The Mock Protocol should transfer USDC back to the RouterAgent upon withdrawal
        IMockLendingProtocol(currentProtocol).withdraw(user, balance); 

        // 3. DEPOSIT: Deposit all funds into the new protocol
        IMockLendingProtocol(targetProtocol).deposit(user, balance);

        // 4. Update State: Record the new location of the user's funds
        userCurrentProtocol[user] = newProtocolId;
    }

    // ====================================================================
    // 5. INTERNAL HELPER FUNCTIONS
    // ====================================================================

    function _routeInitialDeposit(address user, uint256 amount) internal {
        // Default routing upon first deposit: to Protocol A (ID: 1)
        IMockLendingProtocol(protocolA).deposit(user, amount);
        userCurrentProtocol[user] = 1; 
    }

    function _routeToProtocol(uint8 protocolId, uint256 amount) internal {
        // Helper for routing subsequent deposits to the current protocol
        address currentProtocol = _getProtocolAddress(protocolId);
        IMockLendingProtocol(currentProtocol).deposit(msg.sender, amount);
    }
    
    function _getProtocolAddress(uint8 protocolId) internal view returns (address) {
        if (protocolId == 1) return protocolA;
        if (protocolId == 2) return protocolB;
        revert("RouterAgent: Invalid protocol ID");
    }

    // Fallback: Optional, ensures the contract can reject random ETH transfers (Arc L1 uses USDC for gas)
    receive() external payable {
        revert("RouterAgent: Cannot receive ETH directly");
    }
}