// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {SmartDeFiRouterAgent} from "../src/SmartDeFiRouterAgent.sol";
import {AaveAdapter} from "../src/adapters/AaveAdapter.sol";
import {ArcProtocolAdapter} from "../src/adapters/ArcProtocolAdapter.sol";

/**
 * @title DeploySmartDeFiRouter
 * @notice Deployment script for Smart DeFi Router Agent on Arc Network
 * @dev Deploys main router + protocol adapters
 */
contract DeploySmartDeFiRouter is Script {

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ARC_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Network-aware env loading (Arc vs Sepolia)
        // Sepolia chain id: 11155111
        address keeper;
        address arcProtocol;
        address usdc;
        address cctpTokenMessenger;
        address cctpMessageTransmitter;
        address aavePool;
        address aaveDataProvider;

        if (block.chainid == 11155111) {
            // Sepolia
            keeper = vm.envAddress("SEPOLIA_WALLET_ADDRESS");
            // For Sepolia CCTP/USDC testing
            usdc = vm.envAddress("USDC_SEPOLIA");
            cctpTokenMessenger = vm.envAddress("CCTP_TOKEN_MESSENGER_SEPOLIA");
            cctpMessageTransmitter = vm.envAddress("CCTP_MESSAGE_TRANSMITTER_SEPOLIA");
            aavePool = vm.envAddress("AAVE_POOL_SEPOLIA");
            aaveDataProvider = vm.envAddress("AAVE_DATA_PROVIDER_SEPOLIA");
            // Arc protocol adapter is not applicable on Sepolia; keep optional via env
            arcProtocol = vm.envOr("ARC_PROTOCOL_SEPOLIA", address(0));
        } else {
            // Arc testnet (default)
            keeper = vm.envAddress("ARC_WALLET_ADDRESS");
            arcProtocol = vm.envAddress("ARC_PROTOCOL");
            usdc = vm.envAddress("USDC_ARC");
            cctpTokenMessenger = vm.envAddress("CCTP_TOKEN_MESSENGER");
            cctpMessageTransmitter = vm.envAddress("CCTP_MESSAGE_TRANSMITTER");
            aavePool = vm.envAddress("AAVE_POOL");
            aaveDataProvider = vm.envAddress("AAVE_DATA_PROVIDER");
        }

        // Deploy main router
        SmartDeFiRouterAgent router = new SmartDeFiRouterAgent(
            usdc,
            keeper,
            address(0) // No initial protocol
        );
        
        console2.log("Router deployed at:", address(router));
        
        // Deploy protocol adapters
        AaveAdapter aaveAdapter = new AaveAdapter(
            usdc,
            aavePool,
            aaveDataProvider,
            address(router)
        );
        console2.log("Aave Adapter deployed at:", address(aaveAdapter));
        
        // Deploy Arc protocol adapter only if an address is provided for this network
        ArcProtocolAdapter arcAdapter;
        if (arcProtocol != address(0)) {
            arcAdapter = new ArcProtocolAdapter(
                usdc,
                arcProtocol,
                address(router)
            );
            console2.log("Arc Protocol Adapter deployed at:", address(arcAdapter));
        }
        
        // Register protocols
        router.registerProtocol(address(aaveAdapter), "Aave V3");
        if (address(arcAdapter) != address(0)) {
            router.registerProtocol(address(arcAdapter), "Arc Protocol");
        }
        
        // Configure CCTP
        router.configureCctp(
            cctpTokenMessenger,
            cctpMessageTransmitter
        );
        
        console2.log("Deployment complete!");
        console2.log("Router:", address(router));
        console2.log("Keeper (ARC_WALLET_ADDRESS):", keeper);
        if (block.chainid == 11155111) {
            console2.log("Network: Sepolia (11155111)");
        } else {
            console2.log("Network: Arc Testnet (chainId:", block.chainid, ")");
        }
        console2.log("Arc Protocol (ARC_PROTOCOL or ARC_PROTOCOL_SEPOLIA):", arcProtocol);
        console2.log("USDC:", usdc);
        console2.log("AAVE_POOL:", aavePool);
        console2.log("AAVE_DATA_PROVIDER:", aaveDataProvider);
        console2.log("CCTP_TOKEN_MESSENGER:", cctpTokenMessenger);
        console2.log("CCTP_MESSAGE_TRANSMITTER:", cctpMessageTransmitter);
        console2.log("Registered protocols:", address(arcProtocol) != address(0) ? uint256(2) : uint256(1));
        
        vm.stopBroadcast();
    }
}

