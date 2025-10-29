// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {SmartDeFiRouterAgent} from "../src/SmartDeFiRouterAgent.sol";
import {AaveAdapter} from "../src/adapters/AaveAdapter.sol";
import {CurveAdapter} from "../src/adapters/CurveAdapter.sol";
import {YearnAdapter} from "../src/adapters/YearnAdapter.sol";
import {ArcProtocolAdapter} from "../src/adapters/ArcProtocolAdapter.sol";

/**
 * @title DeploySmartDeFiRouter
 * @notice Deployment script for Smart DeFi Router Agent on Arc Network
 * @dev Deploys main router + protocol adapters
 */
contract DeploySmartDeFiRouter is Script {
    
    // Arc Testnet addresses (update with actual addresses)
    address constant USDC_ARC = address(0); // TO BE UPDATED
    address constant KEEPER = address(0); // TO BE UPDATED
    
    // Protocol addresses (update with actual addresses)
    address constant AAVE_POOL = address(0);
    address constant AAVE_DATA_PROVIDER = address(0);
    address constant CURVE_POOL = address(0);
    address constant CURVE_GAUGE = address(0);
    address constant YEARN_VAULT = address(0);
    address constant ARC_PROTOCOL = address(0);
    
    // Circle CCTP addresses
    address constant CCTP_TOKEN_MESSENGER = address(0);
    address constant CCTP_MESSAGE_TRANSMITTER = address(0);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ARC_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy main router
        SmartDeFiRouterAgent router = new SmartDeFiRouterAgent(
            USDC_ARC,
            KEEPER,
            address(0) // No initial protocol
        );
        
        console2.log("Router deployed at:", address(router));
        
        // Deploy protocol adapters
        AaveAdapter aaveAdapter = new AaveAdapter(
            USDC_ARC,
            AAVE_POOL,
            AAVE_DATA_PROVIDER,
            address(router)
        );
        console2.log("Aave Adapter deployed at:", address(aaveAdapter));
        
        CurveAdapter curveAdapter = new CurveAdapter(
            USDC_ARC,
            CURVE_POOL,
            CURVE_GAUGE,
            address(router)
        );
        console2.log("Curve Adapter deployed at:", address(curveAdapter));
        
        YearnAdapter yearnAdapter = new YearnAdapter(
            USDC_ARC,
            YEARN_VAULT,
            address(router)
        );
        console2.log("Yearn Adapter deployed at:", address(yearnAdapter));
        
        ArcProtocolAdapter arcAdapter = new ArcProtocolAdapter(
            USDC_ARC,
            ARC_PROTOCOL,
            address(router)
        );
        console2.log("Arc Protocol Adapter deployed at:", address(arcAdapter));
        
        // Register protocols
        router.registerProtocol(address(aaveAdapter), "Aave V3");
        router.registerProtocol(address(curveAdapter), "Curve Finance");
        router.registerProtocol(address(yearnAdapter), "Yearn Finance");
        router.registerProtocol(address(arcAdapter), "Arc Protocol");
        
        // Configure CCTP
        router.configureCCTP(
            CCTP_TOKEN_MESSENGER,
            CCTP_MESSAGE_TRANSMITTER
        );
        
        console2.log("Deployment complete!");
        console2.log("Router:", address(router));
        console2.log("Registered protocols: 4");
        
        vm.stopBroadcast();
    }
}

