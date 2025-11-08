// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/mocks/MockArcProtocol.sol";

contract DeployMock is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy Mock Arc Protocol A (5% APY)
        MockArcProtocol mockA = new MockArcProtocol(
            usdc,
            "Arc Protocol A",
            500  // 5% APY
        );
        console.log("Mock A deployed at:", address(mockA));
        
        // Deploy Mock Arc Protocol B (8% APY)
        MockArcProtocol mockB = new MockArcProtocol(
            usdc,
            "Arc Protocol B",
            800  // 8% APY
        );
        console.log("Mock B deployed at:", address(mockB));
        
        vm.stopBroadcast();
        
        // Summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("USDC Address:", usdc);
        console.log("Mock A Address:", address(mockA));
        console.log("Mock A APY: 5%");
        console.log("Mock B Address:", address(mockB));
        console.log("Mock B APY: 8%");
    }
}