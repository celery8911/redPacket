// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/RedPacket.sol";

contract RedPacketTest is Test {
    RedPacket public redPacket;
    address public creator = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);

    function setUp() public {
        redPacket = new RedPacket();
        vm.deal(creator, 100 ether);
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
    }

    function testCreateEqualPacket() public {
        vm.startPrank(creator);
        uint256 amount = 1 ether;
        uint256 count = 2;
        
        // Capture the event to get the ID
        vm.recordLogs();
        redPacket.createPacket{value: amount}(count, RedPacket.PacketType.Equal);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        
        // The first event should be PacketCreated
        bytes32 packetId = entries[0].topics[1];
        
        RedPacket.Packet memory packet = redPacket.getPacketDetails(packetId);
        assertEq(packet.creator, creator);
        assertEq(packet.totalAmount, amount);
        assertEq(packet.count, count);
        assertEq(uint(packet.packetType), uint(RedPacket.PacketType.Equal));
        vm.stopPrank();
    }

    function testClaimEqualPacket() public {
        // 1. Create Packet
        vm.startPrank(creator);
        uint256 amount = 1 ether;
        uint256 count = 2;
        vm.recordLogs();
        redPacket.createPacket{value: amount}(count, RedPacket.PacketType.Equal);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 packetId = entries[0].topics[1];
        vm.stopPrank();

        // 2. User 1 Claims
        vm.startPrank(user1);
        uint256 balanceBefore = user1.balance;
        redPacket.claimPacket(packetId);
        uint256 balanceAfter = user1.balance;
        assertEq(balanceAfter - balanceBefore, 0.5 ether);
        vm.stopPrank();

        // 3. User 2 Claims
        vm.startPrank(user2);
        balanceBefore = user2.balance;
        redPacket.claimPacket(packetId);
        balanceAfter = user2.balance;
        assertEq(balanceAfter - balanceBefore, 0.5 ether);
        vm.stopPrank();

        // 4. Verify Packet State
        RedPacket.Packet memory packet = redPacket.getPacketDetails(packetId);
        assertEq(packet.remainingAmount, 0);
        assertEq(packet.remainingCount, 0);
    }

    function testClaimRandomPacket() public {
        // 1. Create Packet
        vm.startPrank(creator);
        uint256 amount = 1 ether;
        uint256 count = 3;
        vm.recordLogs();
        redPacket.createPacket{value: amount}(count, RedPacket.PacketType.Random);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 packetId = entries[0].topics[1];
        vm.stopPrank();

        // 2. Claims
        uint256 claimedTotal = 0;

        vm.prank(user1);
        redPacket.claimPacket(packetId);
        RedPacket.Packet memory p1 = redPacket.getPacketDetails(packetId);
        claimedTotal += (amount - p1.remainingAmount);

        vm.prank(user2);
        redPacket.claimPacket(packetId);
        RedPacket.Packet memory p2 = redPacket.getPacketDetails(packetId);
        claimedTotal += (p1.remainingAmount - p2.remainingAmount);

        vm.prank(user3);
        redPacket.claimPacket(packetId);
        RedPacket.Packet memory p3 = redPacket.getPacketDetails(packetId);
        claimedTotal += (p2.remainingAmount - p3.remainingAmount);

        // 3. Verify Total
        assertEq(claimedTotal, amount);
        assertEq(p3.remainingAmount, 0);
        assertEq(p3.remainingCount, 0);
    }

    function testCannotDoubleClaim() public {
        vm.startPrank(creator);
        vm.recordLogs();
        redPacket.createPacket{value: 1 ether}(2, RedPacket.PacketType.Equal);
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 packetId = entries[0].topics[1];
        vm.stopPrank();

        vm.startPrank(user1);
        redPacket.claimPacket(packetId);
        
        vm.expectRevert("Already claimed");
        redPacket.claimPacket(packetId);
        vm.stopPrank();
    }
}
