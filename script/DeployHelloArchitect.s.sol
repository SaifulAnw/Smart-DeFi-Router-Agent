// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {HelloArchitect} from "../src/HellloArchitect.sol";

contract DeployHelloArchitect is Script {
    function run() external returns (HelloArchitect) {
        // Get private key from environment variable
        uint256 deployerPrivateKey = vm.envUint("ARC_PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the contract
        HelloArchitect helloArchitect = new HelloArchitect();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        return helloArchitect;
    }
}

