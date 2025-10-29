// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Aave V3 Interfaces
 */
interface IPool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
    
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}

interface IPoolDataProvider {
    function getUserReserveData(
        address asset,
        address user
    ) external view returns (
        uint256 currentATokenBalance,
        uint256 currentStableDebt,
        uint256 currentVariableDebt,
        uint256 principalStableDebt,
        uint256 scaledVariableDebt,
        uint256 stableBorrowRate,
        uint256 liquidityRate,
        uint40 stableRateLastUpdated,
        bool usageAsCollateralEnabled
    );
}

/**
 * @title AaveAdapter
 * @notice Protocol adapter for Aave V3 lending protocol
 * @dev Implements IProtocolAdapter interface for Aave integration
 */
contract AaveAdapter is Ownable {
    
    IERC20 public immutable USDC;
    IPool public immutable aavePool;
    IPoolDataProvider public immutable dataProvider;
    address public immutable router;
    
    event AaveDeposit(uint256 amount, uint256 timestamp);
    event AaveWithdraw(uint256 amount, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    modifier onlyRouter() {
        if (msg.sender != router) revert UnauthorizedCaller();
        _;
    }
    
    constructor(
        address _usdc,
        address _aavePool,
        address _dataProvider,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        aavePool = IPool(_aavePool);
        dataProvider = IPoolDataProvider(_dataProvider);
        router = _router;
    }
    
    /**
     * @notice Deploy USDC into Aave
     * @param amount Amount to deposit
     * @param data Additional data (unused for Aave)
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        USDC.transferFrom(msg.sender, address(this), amount);
        
        // Approve Aave pool
        USDC.approve(address(aavePool), amount);
        
        // Supply to Aave
        aavePool.supply(
            address(USDC),
            amount,
            address(this),
            0 // No referral code
        );
        
        emit AaveDeposit(amount, block.timestamp);
        return true;
    }
    
    /**
     * @notice Withdraw USDC from Aave
     * @param amount Amount to withdraw
     * @param data Additional data (unused for Aave)
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Withdraw from Aave
        uint256 withdrawn = aavePool.withdraw(
            address(USDC),
            amount,
            router // Send directly to router
        );
        
        if (withdrawn != amount) revert WithdrawFailed();
        
        emit AaveWithdraw(amount, block.timestamp);
        return true;
    }
    
    /**
     * @notice Get current balance in Aave
     * @return balance Current aToken balance
     */
    function getBalance() external view returns (uint256 balance) {
        (uint256 aTokenBalance,,,,,,,, ) = dataProvider.getUserReserveData(
            address(USDC),
            address(this)
        );
        return aTokenBalance;
    }
    
    /**
     * @notice Get current APY from Aave
     * @return apy Current supply APY in basis points
     */
    function getAPY() external view returns (uint256 apy) {
        (,,,,,, uint256 liquidityRate,, ) = dataProvider.getUserReserveData(
            address(USDC),
            address(this)
        );
        
        // Convert liquidityRate to basis points (APY)
        // Aave returns rate in ray (27 decimals)
        return (liquidityRate / 1e23); // Convert to basis points
    }
}

