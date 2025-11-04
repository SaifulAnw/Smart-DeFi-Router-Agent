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
    IPool public immutable AAVE_POOL;
    IPoolDataProvider public immutable DATA_PROVIDER;
    address public immutable ROUTER;
    
    event AaveDeposit(uint256 amount, uint256 timestamp);
    event AaveWithdraw(uint256 amount, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    // 1. Define an internal function containing the checking logic
    function _onlyRouter() internal view {
        if (msg.sender != ROUTER) revert UnauthorizedCaller();
    }

    // 2. The modifier now only calls the internal function
    modifier onlyRouter() {
        _onlyRouter(); // Call the checking logic
        _;
    }
    
    constructor(
        address _usdc,
        address _aavePool,
        address _dataProvider,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        AAVE_POOL = IPool(_aavePool);
        DATA_PROVIDER = IPoolDataProvider(_dataProvider);
        ROUTER = _router;
    }
    
    /**
     * @notice Deploy USDC into Aave
     * @param amount Amount to deposit
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        // NOTE: In Aave V3, Router should have already APPROVED the Aave Pool beforehand.
        // If not, must call USDC.transferFrom(router, address(this), amount) 
        // AND Router should have approved this Adapter.
        // However, in the Adapter architecture, the Adapter typically requests transfer/approval.

        // In the Adapter architecture, Router will:
        // 1. APPROVE Adapter
        // 2. CALL Adapter.deposit(amount, data)
        // 3. Adapter calls USDC.transferFrom(Router, Adapter, amount)
        
        // Assumption: Router has already approved this Adapter
        // 1. Check the return value of transferFrom for the security of the old token.
        require(
        USDC.transferFrom(msg.sender, address(this), amount),
            "AaveAdapter: USDC transferFrom failed"
        );

        // 2. Continue the contract logic
        // Approve Aave pool (Replace aavePool with AAVE_POOL if have implemented SCREAMING_SNAKE_CASE)
        USDC.approve(address(AAVE_POOL), amount); // Using the new convention

        // Supply to Aave (Replace aavePool with AAVE_POOL)
        AAVE_POOL.supply( // Using the new convention
            address(USDC),
            amount,
            address(this),
            0 // No referral code
        );
                
        // Approve Aave pool (Adapter must approve Aave)
        USDC.approve(address(AAVE_POOL), amount);
        
        // Supply to Aave
        AAVE_POOL.supply(
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
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Withdraw from Aave
        uint256 withdrawn = AAVE_POOL.withdraw(
            address(USDC),
            amount,
            ROUTER // Send directly to router
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
        (uint256 aTokenBalance,,,,,,,, ) = DATA_PROVIDER.getUserReserveData(
            address(USDC),
            address(this)
        );
        return aTokenBalance;
    }
    
    /**
     * @notice Get current APY from Aave
     * @return apy Current supply APY in basis points
     */
    function getApy() external view returns (uint256 apy) {
        (,,,,,, uint256 liquidityRate,, ) = DATA_PROVIDER.getUserReserveData(
            address(USDC),
            address(this)
        );
        
        // Convert liquidityRate from Ray (27 decimals) to basis points (4 decimals)
        // Ray (1e27) / 1e23 = 1e4 (Basis Points)
        // e.g., 0.037 * 1e27 (Ray) / 1e23 = 370 (bps)
        return (liquidityRate / 1e23); 
    }
}