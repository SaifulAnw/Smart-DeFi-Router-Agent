// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Yearn V3 Vault Interface
 */
interface IYearnVault {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function balanceOf(address account) external view returns (uint256);
    function convertToAssets(uint256 shares) external view returns (uint256);
    function pricePerShare() external view returns (uint256);
}

/**
 * @title YearnAdapter
 * @notice Protocol adapter for Yearn Finance vaults
 * @dev Implements IProtocolAdapter for Yearn V3 integration
 */
contract YearnAdapter is Ownable {
    
    IERC20 public immutable USDC;
    IYearnVault public immutable yearnVault;
    address public immutable router;
    
    event YearnDeposit(uint256 amount, uint256 shares, uint256 timestamp);
    event YearnWithdraw(uint256 amount, uint256 sharesBurned, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    modifier onlyRouter() {
        if (msg.sender != router) revert UnauthorizedCaller();
        _;
    }
    
    constructor(
        address _usdc,
        address _yearnVault,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        yearnVault = IYearnVault(_yearnVault);
        router = _router;
    }
    
    /**
     * @notice Deploy USDC into Yearn vault
     * @param amount Amount to deposit
     * @param data Additional data (unused for Yearn)
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        USDC.transferFrom(msg.sender, address(this), amount);
        
        // Approve Yearn vault
        USDC.approve(address(yearnVault), amount);
        
        // Deposit and receive vault shares
        uint256 shares = yearnVault.deposit(amount, address(this));
        
        emit YearnDeposit(amount, shares, block.timestamp);
        return true;
    }
    
    /**
     * @notice Withdraw USDC from Yearn vault
     * @param amount Amount of USDC to withdraw
     * @param data Additional data (unused for Yearn)
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Withdraw from Yearn (burns shares, receives USDC)
        uint256 sharesBurned = yearnVault.withdraw(
            amount,
            router, // Send USDC to router
            address(this) // Burn shares from this adapter
        );
        
        emit YearnWithdraw(amount, sharesBurned, block.timestamp);
        return true;
    }
    
    /**
     * @notice Get current balance in Yearn vault
     * @return balance Current value in USDC
     */
    function getBalance() external view returns (uint256 balance) {
        uint256 shares = yearnVault.balanceOf(address(this));
        return yearnVault.convertToAssets(shares);
    }
    
    /**
     * @notice Get current APY from Yearn vault
     * @return apy Current APY in basis points
     */
    function getAPY() external view returns (uint256 apy) {
        // Yearn vault APY would typically be fetched from:
        // 1. Yearn's on-chain registry
        // 2. Historical pricePerShare growth
        // 3. Off-chain Yearn API
        
        // Simplified placeholder
        // In production, calculate from price per share change over time
        return 600; // Placeholder: 6% APY
    }
}

