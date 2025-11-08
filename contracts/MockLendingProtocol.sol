// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ====================================================================
// MOCK LENDING PROTOCOL (ACCOUNTING-ONLY VERSION)
// - Directly compatible with RouterAgentV2 (deposit/withdraw do NOT
//   perform actual USDC token transfers; only internal accounting).
// - Suitable for quick demos: Router holds USDC, this protocol
//   only tracks "who owns how much".
// ====================================================================

contract MockLendingProtocol {
    // Stores "virtual" user balances in this protocol
    mapping(address => uint256) public balances;
    
    // Total "virtual" funds recorded in this protocol
    uint256 public totalAssets;
    
    // Optional: label/name for easy identification in events/logs
    string public name;
    
    // Events for transparency during deposit/withdraw
    event MockDeposit(address indexed user, uint256 amount, uint256 newUserBalance, uint256 newTotalAssets);
    event MockWithdraw(address indexed user, uint256 amount, uint256 newUserBalance, uint256 newTotalAssets);
    
    // Constructor: set protocol label (e.g., "Protocol A")
    constructor(string memory _name) {
        name = _name; // store protocol name for information
    }
    
    // ----------------------------------------------------------------
    // Virtual deposit function:
    // - Called by RouterAgentV2
    // - Records increase in user balance & totalAssets
    // - Does not pull actual USDC tokens (as per MVP)
    // ----------------------------------------------------------------
    function deposit(address user, uint256 amount) external {
        require(user != address(0), "USER_0");            // ensure valid user address
        require(amount > 0, "AMOUNT_0");                  // ensure amount > 0
        
        balances[user] += amount;                         // increase user virtual balance
        totalAssets += amount;                            // increase protocol total "assets"
        
        emit MockDeposit(user, amount, balances[user], totalAssets); // log event for debugging
    }
    
    // ----------------------------------------------------------------
    // Virtual withdraw function:
    // - Called by RouterAgentV2
    // - Reduces user balance & totalAssets
    // - Actual USDC tokens are sent by Router, not by this protocol
    // ----------------------------------------------------------------
    function withdraw(address user, uint256 amount) external {
        require(user != address(0), "USER_0");            // ensure valid user address
        require(amount > 0, "AMOUNT_0");                  // ensure amount > 0
        require(balances[user] >= amount, "INSUFFICIENT");// check sufficient virtual balance
        
        balances[user] -= amount;                         // decrease user virtual balance
        totalAssets -= amount;                            // decrease protocol total "assets"
        
        emit MockWithdraw(user, amount, balances[user], totalAssets); // log event
    }
    
    // Helper: view user balance
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];                            // return user virtual balance
    }
}