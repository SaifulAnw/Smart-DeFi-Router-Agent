// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IArcProtocol
 * @notice Interface for Arc Network native DeFi protocols
 * @dev Generic interface for Arc ecosystem protocols
 */
interface IArcProtocol {
    function stake(uint256 amount) external returns (uint256 shares);
    function unstake(uint256 shares) external returns (uint256 amount);
    function balanceOf(address account) external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function totalShares() external view returns (uint256);
    function getCurrentAPY() external view returns (uint256);
}

/**
 * @title ArcProtocolAdapter
 * @notice Protocol adapter for Arc Network partner protocols
 * @dev Generic adapter for Arc ecosystem DeFi protocols
 */
contract ArcProtocolAdapter is Ownable {
    
    IERC20 public immutable USDC;
    IArcProtocol public immutable arcProtocol;
    address public immutable router;
    
    event ArcDeposit(uint256 amount, uint256 shares, uint256 timestamp);
    event ArcWithdraw(uint256 amount, uint256 sharesBurned, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    modifier onlyRouter() {
        if (msg.sender != router) revert UnauthorizedCaller();
        _;
    }
    
    constructor(
        address _usdc,
        address _arcProtocol,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        arcProtocol = IArcProtocol(_arcProtocol);
        router = _router;
    }
    
    /**
     * @notice Deploy USDC into Arc protocol
     * @param amount Amount to deposit
     * @param data Additional protocol-specific data
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        USDC.transferFrom(msg.sender, address(this), amount);
        
        // Approve Arc protocol
        USDC.approve(address(arcProtocol), amount);
        
        // Stake in Arc protocol
        uint256 shares = arcProtocol.stake(amount);
        
        emit ArcDeposit(amount, shares, block.timestamp);
        return true;
    }
    
    /**
     * @notice Withdraw USDC from Arc protocol
     * @param amount Amount of USDC to withdraw
     * @param data Additional protocol-specific data
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Calculate shares needed
        uint256 totalShares = arcProtocol.totalShares();
        uint256 totalAssets = arcProtocol.totalAssets();
        uint256 sharesToBurn = (amount * totalShares) / totalAssets;
        
        // Unstake from Arc protocol
        uint256 withdrawn = arcProtocol.unstake(sharesToBurn);
        
        // Transfer USDC to router
        USDC.transfer(router, withdrawn);
        
        emit ArcWithdraw(withdrawn, sharesToBurn, block.timestamp);
        return true;
    }
    
    /**
     * @notice Get current balance in Arc protocol
     * @return balance Current value in USDC
     */
    function getBalance() external view returns (uint256 balance) {
        uint256 shares = arcProtocol.balanceOf(address(this));
        uint256 totalShares = arcProtocol.totalShares();
        uint256 totalAssets = arcProtocol.totalAssets();
        
        if (totalShares == 0) return 0;
        
        return (shares * totalAssets) / totalShares;
    }
    
    /**
     * @notice Get current APY from Arc protocol
     * @return apy Current APY in basis points
     */
    function getAPY() external view returns (uint256 apy) {
        return arcProtocol.getCurrentAPY();
    }
}

