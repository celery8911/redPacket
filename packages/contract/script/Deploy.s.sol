// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/RedPacket.sol";

contract DeployRedPacket is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        RedPacket redPacket = new RedPacket();

        vm.stopBroadcast();
        
        console.log("RedPacket deployed to:", address(redPacket));
    }
}
