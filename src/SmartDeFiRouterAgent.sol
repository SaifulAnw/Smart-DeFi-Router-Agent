// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

using SafeERC20 for IERC20;

/**
 * @title IProtocolAdapter
 * @notice Interface for DeFi protocol integrations
 * @dev Each protocol (Aave, Curve, Yearn, etc.) implements this interface
 */
interface IProtocolAdapter {
    /**
     * @notice Deploy USDC into the protocol
     * @param amount Amount of USDC to deposit
     * @param data Protocol-specific data
     * @return success Whether deployment succeeded
     */
    function deposit(uint256 amount, bytes calldata data) external returns (bool success);
    
    /**
     * @notice Withdraw USDC from the protocol
     * @param amount Amount of USDC to withdraw
     * @param data Protocol-specific data
     * @return success Whether withdrawal succeeded
     */
    function withdraw(uint256 amount, bytes calldata data) external returns (bool success);
    
    /**
     * @notice Get current balance in the protocol
     * @return balance Current USDC balance
     */
    function getBalance() external view returns (uint256 balance);
    
    /**
     * @notice Get current APY from the protocol
     * @return apy Current annual percentage yield (in basis points)
     */
    function getApy() external view returns (uint256 apy);
}

/**
 * @title Circle CCTP Interfaces
 */
interface ITokenMessenger {
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);
}

interface IMessageTransmitter {
    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success);
}

/**
 * @title SmartDeFiRouterAgent
 * @author Smart DeFi Router Team
 * @notice AI-guided non-custodial DeFi vault for yield optimization
 * @dev Main contract implementing PRD requirements v1.0
 * 
 * Key Features:
 * - User deposits/withdrawals of USDC on Arc Network
 * - AI-driven rebalancing across protocols
 * - Cross-chain liquidity routing via Circle CCTP
 * - Protocol adapter pattern for modularity
 * - Keeper-based execution model
 */
contract SmartDeFiRouterAgent is Ownable, ReentrancyGuard, Pausable {
    
    // ============ State Variables (PRD Section 5) ============
    
    /// @notice User balances (deposits - withdrawals)
    mapping(address => uint256) public balances;
    
    /// @notice Total USDC deposited in the vault
    uint256 public totalDeposits;
    
    /// @notice Currently active protocol address
    address public currentProtocol;
    
    /// @notice Trusted keeper address (Backend AI)
    address public keeper;
    
    /// @notice USDC token contract (immutable)
    IERC20 public immutable USDC;
    
    // ============ CCTP Integration (PRD Section 11.5) ============
    
    /// @notice Circle's TokenMessenger for burning USDC
    address public cctpTokenMessenger;
    
    /// @notice Circle's MessageTransmitter for minting USDC
    address public cctpMessageTransmitter;
    
    /// @notice Prevent attestation replay attacks
    mapping(bytes32 => bool) public processedAttestations;
    
    // ============ Protocol Management ============
    
    /// @notice Registered protocol adapters
    mapping(address => bool) public registeredProtocols;
    
    /// @notice Protocol metadata
    struct ProtocolInfo {
        string name;
        address adapter;
        uint256 totalAllocated;
        bool active;
    }
    
    mapping(address => ProtocolInfo) public protocols;
    address[] public protocolList;
    
    // ============ Cross-Chain Routing (PRD Section 11.5) ============
    
    struct CrossChainRoute {
        uint256 amount;
        address protocol;
        uint32 destinationDomain;
        bytes32 attestationHash;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(bytes32 => CrossChainRoute) public crossChainRoutes;
    
    // ============ Events ============
    
    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event Withdrawal(
        address indexed user,
        uint256 amount,
        uint256 newBalance,
        uint256 timestamp
    );
    
    event Rebalance(
        address indexed fromProtocol,
        address indexed toProtocol,
        uint256 amount,
        uint256 timestamp
    );
    
    event CrossChainRebalanceInitiated(
        bytes32 indexed routeId,
        uint32 destinationDomain,
        uint256 amount,
        address targetProtocol,
        uint256 timestamp
    );
    
    event CrossChainRebalanceCompleted(
        bytes32 indexed routeId,
        uint256 amount,
        address protocol,
        uint256 timestamp
    );
    
    event ProtocolRegistered(
        address indexed protocol,
        string name,
        uint256 timestamp
    );
    
    event KeeperUpdated(
        address indexed oldKeeper,
        address indexed newKeeper,
        uint256 timestamp
    );
    
    // ============ Errors ============
    
    error UnauthorizedKeeper();
    error InvalidProtocol();
    error InsufficientBalance();
    error InvalidAmount();
    error ProtocolAlreadyRegistered();
    error AttestationAlreadyProcessed();
    error InvalidAttestation();
    error ZeroAddress();
    
    // ============ Modifiers ============
    
    /**
     * @notice Restrict function to keeper only (Backend AI)
     */
    // Add an internal function for onlyKeeper()
    function _onlyKeeper() internal view {
    if (msg.sender != keeper) revert UnauthorizedKeeper();
    }

    // Change the onlyKeeper() modifier
    modifier onlyKeeper() {
    _onlyKeeper();
    _;
    }

    /**
     * @notice Validate protocol is registered
     */
    // Add internal function for onlyRegisteredProtocol()
    function _onlyRegisteredProtocol(address protocol) internal view {
        if (!registeredProtocols[protocol]) revert InvalidProtocol();
    }

    // Change the onlyRegisteredProtocol() modifier
    modifier onlyRegisteredProtocol(address protocol) {
        _onlyRegisteredProtocol(protocol);
        _;
    }
        
    // ============ Constructor ============
    
    /**
     * @param _usdc USDC token address on Arc Network
     * @param _keeper Backend AI/Keeper address
     * @param _initialProtocol Initial protocol to deploy funds
     */
    constructor(
        address _usdc,
        address _keeper,
        address _initialProtocol
    ) Ownable(msg.sender) {
        if (_usdc == address(0) || _keeper == address(0)) revert ZeroAddress();
        
        USDC = IERC20(_usdc);
        keeper = _keeper;
        
        // Set initial protocol if provided
        if (_initialProtocol != address(0)) {
            currentProtocol = _initialProtocol;
            registeredProtocols[_initialProtocol] = true;
        }
    }
    
    // ============ User Functions (PRD Section 5) ============
    
    /**
     * @notice Deposit USDC into the vault
     * @param amount Amount of USDC to deposit
     * @dev Automatically deploys to current protocol
     */
    function depositUsdc(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (amount == 0) revert InvalidAmount(); 

        // 1. Transfer USDC from user to Router (Router receives funds) [cite: 40, 41]
        require(
            USDC.transferFrom(msg.sender, address(this), amount),
            "Router: deposit transferFrom failed"
        ); 

        // 2. Update accounting (State change first) [cite: 42]
        balances[msg.sender] += amount;
        totalDeposits += amount; 

        // 3. Deploy to current protocol (Pull/Adapter pattern)
        if (currentProtocol != address(0)) {
            require(currentProtocol.code.length > 0, "CURRENT_NOT_CONTRACT");
            USDC.approve(currentProtocol, 0);
            USDC.approve(currentProtocol, amount);
            IProtocolAdapter(currentProtocol).deposit(amount, "");
            protocols[currentProtocol].totalAllocated += amount;
        }
        
        emit Deposit(msg.sender, amount, balances[msg.sender], block.timestamp); // [cite: 44]
    }
    
    /**
     * @notice Withdraw USDC from the vault
     * @param amount Amount of USDC to withdraw
     * @dev Withdraws from current protocol and transfers to user
     */
    function withdrawUsdc(uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        if (amount == 0) revert InvalidAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        
        // Update user balance first (CEI pattern)
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        
        // Withdraw from protocol if needed
        if (currentProtocol != address(0)) {
            IProtocolAdapter(currentProtocol).withdraw(amount, "");
            protocols[currentProtocol].totalAllocated -= amount;
        }
        
        // Transfer USDC to user
        require(
            USDC.transfer(msg.sender, amount),
            "Router: withdraw transfer failed"
        );
                
        emit Withdrawal(msg.sender, amount, balances[msg.sender], block.timestamp);
    }
    
    // ============ Keeper Functions (PRD Section 5) ============
    
    /**
     * @notice Execute rebalancing between protocols
     * @param targetProtocol New protocol to deploy funds
     * @param amount Amount to rebalance
     * @param data Protocol-specific data
     * @dev Can only be called by keeper (Backend AI)
     */
    function executeRebalance(
        address targetProtocol,
        uint256 amount,
        bytes calldata data
    ) 
        external 
        onlyKeeper 
        onlyRegisteredProtocol(targetProtocol) 
        nonReentrant 
    {
        if (amount == 0) revert InvalidAmount();
        
        address oldProtocol = currentProtocol;
        
        // Withdraw from current protocol
        if (oldProtocol != address(0) && oldProtocol != targetProtocol) {
            IProtocolAdapter(oldProtocol).withdraw(amount, data);
            protocols[oldProtocol].totalAllocated -= amount;
        }
        
        // Deposit into new protocol
        USDC.approve(targetProtocol, amount);
        IProtocolAdapter(targetProtocol).deposit(amount, data);
        protocols[targetProtocol].totalAllocated += amount;
        
        // Update current protocol
        currentProtocol = targetProtocol;
        
        emit Rebalance(oldProtocol, targetProtocol, amount, block.timestamp);
    }
    
    // ============ Cross-Chain Functions (PRD Section 11.4) ============
    
    /**
     * @notice Initiate cross-chain rebalancing (Source Chain)
     * @param destinationDomain Circle CCTP destination domain
     * @param amount Amount of USDC to transfer
     * @param targetProtocolData Target protocol and deployment data
     * @dev Burns USDC on source chain, signals cross-chain transfer
     */
    function initiateCrossChainRebalance(
        uint32 destinationDomain,
        uint256 amount,
        bytes calldata targetProtocolData
    ) 
        external 
        onlyKeeper 
        nonReentrant 
        returns (bytes32 routeId) 
    {
        if (amount == 0) revert InvalidAmount();
        if (cctpTokenMessenger == address(0)) revert InvalidProtocol();
        
        // Withdraw from current protocol
        if (currentProtocol != address(0)) {
            IProtocolAdapter(currentProtocol).withdraw(amount, "");
            protocols[currentProtocol].totalAllocated -= amount;
        }
        
        // Generate unique route ID
        routeId = keccak256(abi.encodePacked(
            block.chainid,
            destinationDomain,
            amount,
            block.timestamp,
            msg.sender
        ));
        
        // Decode target protocol from data
        (address targetProtocol) = abi.decode(targetProtocolData, (address));
        
        // Store route information
        crossChainRoutes[routeId] = CrossChainRoute({
            amount: amount,
            protocol: targetProtocol,
            destinationDomain: destinationDomain,
            attestationHash: bytes32(0),
            timestamp: block.timestamp,
            completed: false
        });
        
        // Approve and burn USDC via CCTP
        USDC.approve(cctpTokenMessenger, amount);
        
        ITokenMessenger(cctpTokenMessenger).depositForBurn(
            amount,
            destinationDomain,
            bytes32(uint256(uint160(address(this)))), // Mint to this contract on dest chain
            address(USDC)
        );
        
        emit CrossChainRebalanceInitiated(
            routeId,
            destinationDomain,
            amount,
            targetProtocol,
            block.timestamp
        );
        
        return routeId;
    }
    
    /**
     * @notice Complete cross-chain rebalancing (Destination Chain)
     * @param message CCTP message from source chain
     * @param attestation Circle attestation signature
     * @param amount Amount of USDC to deploy
     * @param targetProtocol Protocol to deploy funds into
     * @param targetProtocolData Protocol-specific deployment data
     * @dev Mints USDC on destination chain and deploys to protocol
     */
    function completeCrossChainRebalance(
        bytes calldata message,
        bytes calldata attestation,
        uint256 amount,
        address targetProtocol,
        bytes calldata targetProtocolData
    ) 
        external 
        onlyKeeper 
        onlyRegisteredProtocol(targetProtocol) 
        nonReentrant 
        returns (bytes32 routeId) 
    {
        if (cctpMessageTransmitter == address(0)) revert InvalidProtocol();
        
        // Generate attestation hash for replay protection
        bytes32 attestationHash;
        assembly {
            // copy calldata 'message' into memory and hash it to prevent direct calldata access
            let ptr := mload(0x40)
            calldatacopy(ptr, message.offset, message.length)
            attestationHash := keccak256(ptr, message.length)
            // update free memory pointer (round up to 32 bytes)
            mstore(0x40, add(ptr, and(add(message.length, 31), not(31))))
        }
        
        if (processedAttestations[attestationHash]) {
            revert AttestationAlreadyProcessed();
        }
        
        // Mark attestation as processed
        processedAttestations[attestationHash] = true;
        
        // Receive and mint USDC via CCTP
        bool success = IMessageTransmitter(cctpMessageTransmitter).receiveMessage(
            message,
            attestation
        );
        
        if (!success) revert InvalidAttestation();
        
        // Generate route ID
        routeId = keccak256(abi.encodePacked(
            message,
            amount,
            targetProtocol,
            block.timestamp
        ));
        
        // Deploy minted USDC into target protocol
        USDC.approve(targetProtocol, amount);
        IProtocolAdapter(targetProtocol).deposit(amount, targetProtocolData);
        
        // Update state
        currentProtocol = targetProtocol;
        protocols[targetProtocol].totalAllocated += amount;
        totalDeposits += amount;
        
        emit CrossChainRebalanceCompleted(
            routeId,
            amount,
            targetProtocol,
            block.timestamp
        );
        
        return routeId;
    }
    
    // ============ Protocol Management ============
    
    /**
     * @notice Register a new protocol adapter
     * @param protocol Protocol adapter address
     * @param name Protocol name
     */
    function registerProtocol(
        address protocol,
        string calldata name
    ) external onlyOwner {
        if (protocol == address(0)) revert ZeroAddress();
        if (registeredProtocols[protocol]) revert ProtocolAlreadyRegistered();
        
        registeredProtocols[protocol] = true;
        protocols[protocol] = ProtocolInfo({
            name: name,
            adapter: protocol,
            totalAllocated: 0,
            active: true
        });
        
        protocolList.push(protocol);
        
        emit ProtocolRegistered(protocol, name, block.timestamp);
    }
    
    /**
     * @notice Deregister a protocol
     * @param protocol Protocol to deregister
     */
    function deregisterProtocol(address protocol) external onlyOwner {
        registeredProtocols[protocol] = false;
        protocols[protocol].active = false;
    }
    

    function setCurrentProtocol(address adapter) external onlyOwner {
        if (!registeredProtocols[adapter]) revert("NOT_REGISTERED");
        if (adapter.code.length == 0) revert("NOT_CONTRACT");
        currentProtocol = adapter;
    }

    // ============ Admin Functions ============
    
    /**
     * @notice Configure Circle CCTP addresses
     * @param _tokenMessenger TokenMessenger address
     * @param _messageTransmitter MessageTransmitter address
     */
    function configureCctp(
        address _tokenMessenger,
        address _messageTransmitter
    ) external onlyOwner {
        cctpTokenMessenger = _tokenMessenger;
        cctpMessageTransmitter = _messageTransmitter;
    }
    
    /**
     * @notice Update keeper address
     * @param newKeeper New keeper address
     */
    function updateKeeper(address newKeeper) external onlyOwner {
        if (newKeeper == address(0)) revert ZeroAddress();
        
        address oldKeeper = keeper;
        keeper = newKeeper;
        
        emit KeeperUpdated(oldKeeper, newKeeper, block.timestamp);
    }
    
    /**
     * @notice Pause contract operations
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Emergency withdrawal (owner only)
     * @param token Token to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(
            IERC20(token).transfer(owner(), balance),
            "Router: token recovery failed"
        );
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's current balance
     * @param user User address
     * @return balance User's USDC balance in the vault
     */
    function getUserBalance(address user) external view returns (uint256) {
        return balances[user];
    }
    
    /**
     * @notice Get current protocol allocation
     * @param protocol Protocol address
     * @return info Protocol information
     */
    function getProtocolInfo(address protocol) 
        external 
        view 
        returns (ProtocolInfo memory info) 
    {
        return protocols[protocol];
    }
    
    /**
     * @notice Get all registered protocols
     * @return List of protocol addresses
     */
    function getRegisteredProtocols() external view returns (address[] memory) {
        return protocolList;
    }
    
    /**
     * @notice Get current APY from active protocol
     * @return apy Current APY in basis points
     */
    function getCurrentApy() external view returns (uint256 apy) {
        if (currentProtocol == address(0)) return 0;
        return IProtocolAdapter(currentProtocol).getApy();
    }
    
    /**
     * @notice Get total value locked in the vault
     * @return tvl Total value locked
     */
    function getTotalValueLocked() external view returns (uint256 tvl) {
        return totalDeposits;
    }
    
    /**
     * @notice Get cross-chain route details
     * @param routeId Route ID
     * @return route Route information
     */
    function getCrossChainRoute(bytes32 routeId) 
        external 
        view 
        returns (CrossChainRoute memory route) 
    {
        return crossChainRoutes[routeId];
    }
}

