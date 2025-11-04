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
    function getCurrentApy() external view returns (uint256);
}

/**
 * @title ArcProtocolAdapter
 * @notice Protocol adapter for Arc Network partner protocols
 * @dev Generic adapter for Arc ecosystem DeFi protocols
 */
contract ArcProtocolAdapter is Ownable {
    
    IERC20 public immutable USDC;
    IArcProtocol public immutable ARC_PROTOCOL;
    address public immutable ROUTER;
    
    event ArcDeposit(uint256 amount, uint256 shares, uint256 timestamp);
    event ArcWithdraw(uint256 amount, uint256 sharesBurned, uint256 timestamp);
    
    error UnauthorizedCaller();
    error DepositFailed();
    error WithdrawFailed();
    
    // Add internal function
    function _onlyRouter() internal view {
        if (msg.sender != ROUTER) revert UnauthorizedCaller();
    }

    // Change modifiers
    modifier onlyRouter() {
        _onlyRouter();
        _;
    }
    
    constructor(
        address _usdc,
        address _arcProtocol,
        address _router
    ) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
        ARC_PROTOCOL = IArcProtocol(_arcProtocol);
        ROUTER = _router;
    }
    
    /**
     * @notice Deploy USDC into Arc protocol
     * @param amount Amount to deposit
     * @return success Whether deposit succeeded
     */
    function deposit(uint256 amount, bytes calldata) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Transfer USDC from router
        require(
            USDC.transferFrom(msg.sender, address(this), amount), 
            "ArcAdapter: transferFrom failed"
        );
                
        // Approve Arc protocol
        USDC.approve(address(ARC_PROTOCOL), amount);
        
        // Stake in Arc protocol
        uint256 shares = ARC_PROTOCOL.stake(amount);
        
        emit ArcDeposit(amount, shares, block.timestamp);
        return true;
    }
    
    /**
     * @notice Withdraw USDC from Arc protocol
     * @param amount Amount of USDC to withdraw
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata) 
        external 
        onlyRouter 
        returns (bool success) 
    {
        // Calculate shares needed
        uint256 totalShares = ARC_PROTOCOL.totalShares();
        uint256 totalAssets = ARC_PROTOCOL.totalAssets();
        uint256 sharesToBurn = (amount * totalShares) / totalAssets;
        
        // Unstake from Arc protocol
        uint256 withdrawn = ARC_PROTOCOL.unstake(sharesToBurn);
        
        // Transfer USDC to router
        require(
            USDC.transfer(ROUTER, withdrawn),
            "ArcAdapter: transfer failed"
        );
        
        emit ArcWithdraw(withdrawn, sharesToBurn, block.timestamp);
        return true;
    }
    
    /**
     * @notice Get current balance in Arc protocol
     * @return balance Current value in USDC
     */
    function getBalance() external view returns (uint256 balance) {
        uint256 shares = ARC_PROTOCOL.balanceOf(address(this));
        uint256 totalShares = ARC_PROTOCOL.totalShares();
        uint256 totalAssets = ARC_PROTOCOL.totalAssets();
        
        if (totalShares == 0) return 0;
        
        return (shares * totalAssets) / totalShares;
    }
    
    /**
     * @notice Get current APY from Arc protocol
     * @return apy Current APY in basis points
     */
    function getApy() external view returns (uint256 apy) {
        return ARC_PROTOCOL.getCurrentApy();
    }
}

