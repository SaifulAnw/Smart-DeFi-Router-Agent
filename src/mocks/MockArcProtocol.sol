// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ====================================================================
// MOCK ARC PROTOCOL (SHARES VAULT FOR USDC)
// - Compatible with IArcProtocol used by your ArcProtocolAdapter
// - stake(amount)     -> pulls USDC from caller, mints shares
// - unstake(shares)   -> burns shares, sends USDC back to caller
// - totalAssets/totalShares accounting with SafeERC20
// - getCurrentApy() returns a configurable basis-points value (for AI scoring)
// - Non-reentrant, allowance-safe
// ====================================================================

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IArcProtocol {
    function stake(uint256 amount) external returns (uint256 shares);
    function unstake(uint256 shares) external returns (uint256 amount);
    function balanceOf(address account) external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function totalShares() external view returns (uint256);
    function getCurrentApy() external view returns (uint256);
}

abstract contract ReentrancyGuard {
    uint256 private constant _ENTERED = 1;
    uint256 private constant _NOT_ENTERED = 2;
    uint256 private _status = _NOT_ENTERED;
    
    // Add an internal function for pre-execution logic (pre-check)
    function _nonReentrantBefore() internal {
    require(_status != _ENTERED, "REENTRANCY");
    _status = _ENTERED;
    }

    // Add an internal function for post-execution logic (cleanup)
    function _nonReentrantAfter() internal {
    _status = _NOT_ENTERED;
    }

    // Change the nonReentrant() modifier to only call internal functions
    modifier nonReentrant() {
    _nonReentrantBefore();
    _;
    _nonReentrantAfter();
    }
}

contract MockArcProtocol is IArcProtocol, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ----------------------------- immutables/config
    IERC20  public immutable USDC;        // underlying asset (6 decimals on Arc)
    string  public name;                  // optional label (e.g., "Arc Yield Vault A")
    uint8   public constant DECIMALS = 6; // informational; underlying uses 6
    uint256 private _apyBps;              // mock APY in basis points (e.g., 500 = 5%)

    // ----------------------------- accounting
    uint256 private _totalAssets;         // tracked assets under management (in USDC units)
    uint256 private _totalShares;         // total supply of vault shares
    mapping(address => uint256) private _shares; // shares held by each account (usually adapter)

    // ----------------------------- events
    event Stake(address indexed caller, uint256 amountIn, uint256 sharesOut);
    event Unstake(address indexed caller, uint256 sharesIn, uint256 amountOut);
    event ApyUpdated(uint256 oldApyBps, uint256 newApyBps);

    // ----------------------------- ctor
    constructor(address _usdc, string memory _name, uint256 apyBps_) Ownable(msg.sender) {
        require(_usdc != address(0), "USDC_0");
        USDC = IERC20(_usdc);
        name = _name;
        _apyBps = apyBps_;
    }

    // ===================================================================
    // IArcProtocol — core
    // ===================================================================

    /// @notice Deposit USDC and receive vault shares
    /// @dev Caller must approve USDC to this contract before calling
    function stake(uint256 amount) external nonReentrant returns (uint256 shares) {
        require(amount > 0, "AMOUNT_0");

        // Pull USDC from caller into the vault
        USDC.safeTransferFrom(msg.sender, address(this), amount);

        // Mint shares based on current pricePerShare
        if (_totalShares == 0 || _totalAssets == 0) {
            // First liquidity: 1:1 (round-up not needed; straight mapping)
            shares = amount;
        } else {
            // shares = amount * totalShares / totalAssets  (round up)
            // round up so that depositor never receives less than proportional
            shares = (amount * _totalShares + (_totalAssets - 1)) / _totalAssets;
        }

        require(shares > 0, "SHARES_0");

        // Update accounting
        _totalAssets += amount;
        _totalShares += shares;
        _shares[msg.sender] += shares;

        emit Stake(msg.sender, amount, shares);
        return shares;
    }

    /// @notice Redeem shares for USDC
    function unstake(uint256 shares) external nonReentrant returns (uint256 amount) {
        require(shares > 0, "SHARES_0");
        uint256 bal = _shares[msg.sender];
        require(bal >= shares, "INSUFFICIENT_SHARES");
        require(_totalShares > 0 && _totalAssets > 0, "EMPTY_VAULT");

        // amount = shares * totalAssets / totalShares (round down)
        amount = (shares * _totalAssets) / _totalShares;
        require(amount > 0, "AMOUNT_0");

        // Burn shares first (checks-effects-interactions)
        _shares[msg.sender] = bal - shares;
        _totalShares -= shares;
        _totalAssets -= amount;

        // Send USDC to caller
        USDC.safeTransfer(msg.sender, amount);

        emit Unstake(msg.sender, shares, amount);
        return amount;
    }

    // ===================================================================
    // Views
    // ===================================================================

    function balanceOf(address account) external view returns (uint256) {
        return _shares[account];
    }

    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }

    function totalShares() external view returns (uint256) {
        return _totalShares;
    }

    /// @notice Mock APY (basis points) for scoring
    function getCurrentApy() external view returns (uint256) {
        return _apyBps;
    }

    /// @notice Price per share helper (scaled by 1e6 to match USDC decimals)
    function pricePerShare() external view returns (uint256 pps) {
        if (_totalShares == 0) return 1_000_000; // 1.0 in 6 decimals
        return (_totalAssets * 1_000_000) / _totalShares;
    }

    // ===================================================================
    // Admin (demo utilities)
    // ===================================================================

    /// @notice Update APY used for off-chain scoring (no on-chain accrual)
    function setApyBps(uint256 newApyBps) external onlyOwner {
        uint256 old = _apyBps;
        _apyBps = newApyBps;
        emit ApyUpdated(old, newApyBps);
    }

    /// @notice Owner can rename for clarity in explorer
    function setName(string calldata newName) external onlyOwner {
        name = newName;
    }

    // ---- (Optional) Simulate yield by pushing external USDC or by owner drip ----
    // For realism you can send USDC directly to this contract; then call sync()
    // to align _totalAssets with actual token balance if needed.

    function syncToTokenBalance() external onlyOwner {
        uint256 bal = USDC.balanceOf(address(this));
        _totalAssets = bal;
    }
}