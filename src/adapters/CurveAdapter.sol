// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Curve Finance Interfaces
 */
interface ICurvePool {
    function add_liquidity(
        uint256[2] calldata amounts,
        uint256 min_mint_amount
    ) external returns (uint256);
    
    function remove_liquidity_one_coin(
        uint256 token_amount,
        int128 i,
        uint256 min_amount
    ) external returns (uint256);
    
    function balanceOf(address account) external view returns (uint256);
    
    function get_virtual_price() external view returns (uint256);
}

interface ICurveGauge {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function working_supply() external view returns (uint256);
    function inflation_rate() external view returns (uint256);
}

/**
 * @title CurveAdapter
 * @notice Protocol adapter for Curve Finance
 * @dev Supports Curve pools + gauge staking for USDC
 */
contract CurveAdapter is Ownable {
    
    IERC20 public immutable USDC;
    ICurvePool public immutable curvePool;
    ICurveGauge public immutable gauge;
    address public immutable router;
    
    int128 public constant USDC_INDEX = 1; // USDC index in pool
    
    event CurveDeposit(uint256 amount, uint256 lpTokens, uint256 timestamp);
    event CurveWithdraw(uint256 amount, uint256 lpTokensBurned, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    modifier onlyRouter() {
        if (msg.sender != router) revert UnauthorizedCaller();
        _;
    }
    
    constructor(
        address _usdc,
        address _curvePool,
        address _gauge,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        curvePool = ICurvePool(_curvePool);
        gauge = ICurveGauge(_gauge);
        router = _router;
    }
    
    /**
     * @notice Deploy USDC into Curve pool and stake in gauge
     * @param amount Amount to deposit
     * @param data Minimum LP tokens expected
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        USDC.transferFrom(msg.sender, address(this), amount);
        
        // Approve Curve pool
        USDC.approve(address(curvePool), amount);
        
        // Add liquidity (assuming USDC is at index 1)
        uint256[2] memory amounts;
        amounts[1] = amount; // USDC
        
        uint256 minLpTokens = data.length > 0 ? abi.decode(data, (uint256)) : 0;
        
        uint256 lpTokens = curvePool.add_liquidity(amounts, minLpTokens);
        
        // Stake LP tokens in gauge
        IERC20(address(curvePool)).approve(address(gauge), lpTokens);
        gauge.deposit(lpTokens);
        
        emit CurveDeposit(amount, lpTokens, block.timestamp);
        return true;
    }
    
    /**
     * @notice Withdraw USDC from Curve
     * @param amount Amount of USDC to withdraw
     * @param data Minimum USDC expected
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata data) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Calculate LP tokens needed
        uint256 virtualPrice = curvePool.get_virtual_price();
        uint256 lpToWithdraw = (amount * 1e18) / virtualPrice;
        
        // Withdraw from gauge
        gauge.withdraw(lpToWithdraw);
        
        // Remove liquidity
        uint256 minAmount = data.length > 0 ? abi.decode(data, (uint256)) : amount * 99 / 100;
        
        uint256 withdrawn = curvePool.remove_liquidity_one_coin(
            lpToWithdraw,
            USDC_INDEX,
            minAmount
        );
        
        // Transfer USDC to router
        USDC.transfer(router, withdrawn);
        
        emit CurveWithdraw(withdrawn, lpToWithdraw, block.timestamp);
        return true;
    }
    
    /**
     * @notice Get current balance in Curve (LP tokens staked in gauge)
     * @return balance Current value in USDC terms
     */
    function getBalance() external view returns (uint256 balance) {
        uint256 lpBalance = gauge.balanceOf(address(this));
        uint256 virtualPrice = curvePool.get_virtual_price();
        
        // Convert LP tokens to USDC equivalent
        return (lpBalance * virtualPrice) / 1e18;
    }
    
    /**
     * @notice Get current APY from Curve (base + CRV rewards)
     * @return apy Current APY in basis points
     */
    function getAPY() external view returns (uint256 apy) {
        // Simplified APY calculation
        // In production, this would query Curve's on-chain APY calculator
        // or use off-chain data
        
        uint256 inflationRate = gauge.inflation_rate();
        uint256 workingSupply = gauge.working_supply();
        
        if (workingSupply == 0) return 0;
        
        // Estimate APY (this is simplified)
        // Real implementation would include:
        // - Base pool fees
        // - CRV reward rate
        // - Gauge boost
        return 500; // Placeholder: 5% APY
    }
}

