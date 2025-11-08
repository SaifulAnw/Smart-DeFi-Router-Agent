// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/SmartDeFiRouterAgent.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdc = vm.envAddress("USDC_ADDRESS");
        address keeper = vm.envAddress("KEEPER_ADDRESS");
        address publicAddr = vm.envAddress("PUBLIC_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        SmartDeFiRouterAgent agent = new SmartDeFiRouterAgent(usdc, keeper, publicAddr);
        
        console.log("Deployed at:", address(agent));
        
        vm.stopBroadcast();
    }
}