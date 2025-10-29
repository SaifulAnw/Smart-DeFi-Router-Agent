// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Standard ERC20 Interface for USDC interaction
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

// ====================================================================
// MOCK LENDING PROTOCOL
// ====================================================================

contract MockLendingProtocol {
    // Contract that represents the RouterAgent
    address public immutable ROUTER_AGENT;

    // Address of the USDC contract
    IERC20 public immutable USDC;
    
    // Tracks the simulated balance for each user (their share of the pool)
    mapping(address => uint256) public stakedBalances; 

    // Constructor: Needs to know who the RouterAgent is and the USDC address
    constructor(address _routerAgent, address _usdcAddress) {
        ROUTER_AGENT = _routerAgent;
        USDC = IERC20(_usdcAddress);
    }

    // Simulates receiving funds from the RouterAgent for a specific user
    function deposit(address user, uint256 amount) external {
        // ONLY the RouterAgent can call this function
        require(msg.sender == ROUTER_AGENT, "MockProtocol: Only RouterAgent allowed");

        // 1. Transfer USDC from RouterAgent to MockProtocol
        // Note: For simplicity, we skip the transfer and just update state, 
        // assuming RouterAgent already has the USDC (which it does).
        
        // 2. Update state: user's staked balance increases
        stakedBalances[user] += amount;
    }

    // Simulates returning funds to the RouterAgent
    function withdraw(address user, uint256 amount) external {
        // ONLY the RouterAgent can call this function
        require(msg.sender == ROUTER_AGENT, "MockProtocol: Only RouterAgent allowed");
        
        // 1. Check if the user has enough staked balance
        require(stakedBalances[user] >= amount, "MockProtocol: Insufficient staked balance");

        // 2. Update state: user's staked balance decreases
        stakedBalances[user] -= amount;

        // 3. Transfer USDC from MockProtocol back to RouterAgent
        // In a real scenario, the protocol would return the principal + interest.
        require(USDC.transfer(ROUTER_AGENT, amount), "MockProtocol: USDC return failed");
    }
}