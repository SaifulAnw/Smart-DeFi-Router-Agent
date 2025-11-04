// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {SmartDeFiRouterAgent} from "../src/SmartDeFiRouterAgent.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Mock USDC token for testing
contract MockUSDC is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    
    function mint(address to, uint256 amount) external {
        _balances[to] += amount;
        _totalSupply += amount;
    }
    
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external override returns (bool) {
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        return true;
    }
    
    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        _allowances[from][msg.sender] -= amount;
        _balances[from] -= amount;
        _balances[to] += amount;
        return true;
    }
}

// Mock Protocol Adapter
contract MockProtocolAdapter {
    IERC20 public immutable USDC;
    uint256 public balance;
    
    constructor(address _usdc) {
        USDC = IERC20(_usdc);
    }
    
    function deposit(uint256 amount, bytes calldata) external returns (bool) {
        // Check the return value of transferFrom to prevent an unchecked return value
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "TransferFrom failed" // Error message if transfer fails returns false
        );

        // If require() passes, we can safely update the internal balance
        balance += amount;
        return true;
    }
    
    function withdraw(uint256 amount, bytes calldata) external returns (bool) {
        // Reduce the internal balance FIRST (Best Practice: State changes before external calls)
        balance -= amount;

        // Check the return value of the transfer to prevent an unchecked return value
        require(
            USDC.transfer(msg.sender, amount),
            "Transfer failed" // Error message if the transfer fails, return false
        );

        return true;
    }
    
    function getBalance() external view returns (uint256) {
        return balance;
    }
    
    function getApy() external pure returns (uint256) {
        return 500; // 5% APY
    }
}

contract SmartDeFiRouterAgentTest is Test {
    SmartDeFiRouterAgent public router;
    MockUSDC public usdc;
    MockProtocolAdapter public protocolA;
    MockProtocolAdapter public protocolB;
    
    address public owner;
    address public keeper;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        keeper = makeAddr("keeper");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy mock protocols
        protocolA = new MockProtocolAdapter(address(usdc));
        protocolB = new MockProtocolAdapter(address(usdc));
        
        // Deploy router without initial protocol
        router = new SmartDeFiRouterAgent(
            address(usdc),
            keeper,
            address(0) // No initial protocol
        );
        
        // Register protocols
        router.registerProtocol(address(protocolA), "Protocol A");
        router.registerProtocol(address(protocolB), "Protocol B");
        
        // Mint USDC to users
        usdc.mint(user1, 1_000_000e6);
        usdc.mint(user2, 1_000_000e6);
    }
    
    // ============ Deposit Tests ============
    
    function testDepositUSDC() public {
        uint256 depositAmount = 100_000e6;
        
        vm.startPrank(user1);
        usdc.approve(address(router), depositAmount);
        router.depositUsdc(depositAmount);
        vm.stopPrank();
        
        assertEq(router.getUserBalance(user1), depositAmount);
        assertEq(router.getTotalValueLocked(), depositAmount);
    }
    
    function testDepositMultipleUsers() public {
        uint256 amount1 = 100_000e6;
        uint256 amount2 = 200_000e6;
        
        vm.startPrank(user1);
        usdc.approve(address(router), amount1);
        router.depositUsdc(amount1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        usdc.approve(address(router), amount2);
        router.depositUsdc(amount2);
        vm.stopPrank();
        
        assertEq(router.getUserBalance(user1), amount1);
        assertEq(router.getUserBalance(user2), amount2);
        assertEq(router.getTotalValueLocked(), amount1 + amount2);
    }
    
    function testDepositZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert(SmartDeFiRouterAgent.InvalidAmount.selector);
        router.depositUsdc(0);
        vm.stopPrank();
    }
    
    // ============ Withdrawal Tests ============
    
    function testWithdrawUSDC() public {
        uint256 depositAmount = 100_000e6;
        uint256 withdrawAmount = 50_000e6;
        
        // Deposit first
        vm.startPrank(user1);
        usdc.approve(address(router), depositAmount);
        router.depositUsdc(depositAmount);
        
        uint256 balanceBefore = usdc.balanceOf(user1);
        
        // Withdraw
        router.withdrawUsdc(withdrawAmount);
        vm.stopPrank();
        
        uint256 balanceAfter = usdc.balanceOf(user1);
        
        assertEq(router.getUserBalance(user1), depositAmount - withdrawAmount);
        assertEq(balanceAfter - balanceBefore, withdrawAmount);
    }
    
    function testWithdrawInsufficientBalance() public {
        uint256 depositAmount = 100_000e6;
        uint256 withdrawAmount = 150_000e6;
        
        vm.startPrank(user1);
        usdc.approve(address(router), depositAmount);
        router.depositUsdc(depositAmount);
        
        vm.expectRevert(SmartDeFiRouterAgent.InsufficientBalance.selector);
        router.withdrawUsdc(withdrawAmount);
        vm.stopPrank();
    }
    
    // ============ Rebalance Tests ============
    
    function testExecuteRebalance() public {
        uint256 depositAmount = 100_000e6;
        
        // User deposits
        vm.startPrank(user1);
        usdc.approve(address(router), depositAmount);
        router.depositUsdc(depositAmount);
        vm.stopPrank();
        
        // Keeper rebalances to Protocol B
        vm.prank(keeper);
        router.executeRebalance(address(protocolB), depositAmount, "");
        
        assertEq(router.currentProtocol(), address(protocolB));
    }
    
    function testRebalanceUnauthorized() public {
        vm.prank(user1);
        vm.expectRevert(SmartDeFiRouterAgent.UnauthorizedKeeper.selector);
        router.executeRebalance(address(protocolB), 100_000e6, "");
    }
    
    function testRebalanceUnregisteredProtocol() public {
        address unregisteredProtocol = makeAddr("unregistered");
        
        vm.prank(keeper);
        vm.expectRevert(SmartDeFiRouterAgent.InvalidProtocol.selector);
        router.executeRebalance(unregisteredProtocol, 100_000e6, "");
    }
    
    // ============ Protocol Management Tests ============
    
    function testRegisterProtocol() public {
        address newProtocol = makeAddr("newProtocol");
        
        router.registerProtocol(newProtocol, "New Protocol");
        
        SmartDeFiRouterAgent.ProtocolInfo memory info = router.getProtocolInfo(newProtocol);
        assertEq(info.name, "New Protocol");
        assertEq(info.adapter, newProtocol);
        assertTrue(info.active);
    }
    
    function testRegisterDuplicateProtocol() public {
        vm.expectRevert(SmartDeFiRouterAgent.ProtocolAlreadyRegistered.selector);
        router.registerProtocol(address(protocolA), "Duplicate");
    }
    
    function testDeregisterProtocol() public {
        router.deregisterProtocol(address(protocolA));
        
        SmartDeFiRouterAgent.ProtocolInfo memory info = router.getProtocolInfo(address(protocolA));
        assertFalse(info.active);
    }
    
    // ============ Admin Tests ============
    
    function testUpdateKeeper() public {
        address newKeeper = makeAddr("newKeeper");
        
        router.updateKeeper(newKeeper);
        
        assertEq(router.keeper(), newKeeper);
    }
    
    function testUpdateKeeperUnauthorized() public {
        address newKeeper = makeAddr("newKeeper");
        
        vm.prank(user1);
        vm.expectRevert();
        router.updateKeeper(newKeeper);
    }
    
    function testPauseUnpause() public {
        router.pause();
        
        vm.startPrank(user1);
        usdc.approve(address(router), 100_000e6);
        vm.expectRevert();
        router.depositUsdc(100_000e6);
        vm.stopPrank();
        
        router.unpause();
        
        vm.startPrank(user1);
        router.depositUsdc(100_000e6);
        vm.stopPrank();
        
        assertEq(router.getUserBalance(user1), 100_000e6);
    }
    
    // ============ View Function Tests ============
    
    function testGetCurrentAPY() public {
        // Set current protocol first
        uint256 depositAmount = 100_000e6;
        
        vm.startPrank(user1);
        usdc.approve(address(router), depositAmount);
        router.depositUsdc(depositAmount);
        vm.stopPrank();
        
        // Now rebalance to set current protocol
        vm.prank(keeper);
        router.executeRebalance(address(protocolA), depositAmount, "");
        
        uint256 apy = router.getCurrentApy();
        assertEq(apy, 500); // Mock protocol returns 5%
    }
    
    function testGetProtocolInfo() public view {
        SmartDeFiRouterAgent.ProtocolInfo memory info = router.getProtocolInfo(address(protocolA));
        
        assertEq(info.name, "Protocol A");
        assertEq(info.adapter, address(protocolA));
        assertEq(info.totalAllocated, 0);
        assertTrue(info.active);
    }
    
    function testGetRegisteredProtocols() public view {
        address[] memory protocols = router.getRegisteredProtocols();
        
        assertEq(protocols.length, 2);
        assertEq(protocols[0], address(protocolA));
        assertEq(protocols[1], address(protocolB));
    }
}

