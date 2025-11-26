import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { PacketClaimed, PacketCreated } from "../generated/RedPacket/RedPacket"

export function createPacketClaimedEvent(
  id: Bytes,
  claimer: Address,
  amount: BigInt
): PacketClaimed {
  let packetClaimedEvent = changetype<PacketClaimed>(newMockEvent())

  packetClaimedEvent.parameters = new Array()

  packetClaimedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  packetClaimedEvent.parameters.push(
    new ethereum.EventParam("claimer", ethereum.Value.fromAddress(claimer))
  )
  packetClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return packetClaimedEvent
}

export function createPacketCreatedEvent(
  id: Bytes,
  creator: Address,
  totalAmount: BigInt,
  count: BigInt,
  packetType: i32
): PacketCreated {
  let packetCreatedEvent = changetype<PacketCreated>(newMockEvent())

  packetCreatedEvent.parameters = new Array()

  packetCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromFixedBytes(id))
  )
  packetCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  packetCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "totalAmount",
      ethereum.Value.fromUnsignedBigInt(totalAmount)
    )
  )
  packetCreatedEvent.parameters.push(
    new ethereum.EventParam("count", ethereum.Value.fromUnsignedBigInt(count))
  )
  packetCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "packetType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(packetType))
    )
  )

  return packetCreatedEvent
}
