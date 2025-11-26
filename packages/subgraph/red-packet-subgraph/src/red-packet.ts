import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  PacketClaimed as PacketClaimedEvent,
  PacketCreated as PacketCreatedEvent
} from "../generated/RedPacket/RedPacket"
import { Packet, Claim } from "../generated/schema"

export function handlePacketCreated(event: PacketCreatedEvent): void {
  let packet = new Packet(event.params.id)

  packet.creator = event.params.creator
  packet.totalAmount = event.params.totalAmount
  packet.remainingAmount = event.params.totalAmount
  packet.count = event.params.count
  packet.remainingCount = event.params.count
  packet.packetType = event.params.packetType
  packet.timestamp = event.block.timestamp
  packet.txHash = event.transaction.hash

  packet.save()
}

export function handlePacketClaimed(event: PacketClaimedEvent): void {
  let packet = Packet.load(event.params.id)
  if (packet) {
    packet.remainingAmount = packet.remainingAmount.minus(event.params.amount)
    packet.remainingCount = packet.remainingCount.minus(BigInt.fromI32(1))
    packet.save()

    let claimId = event.transaction.hash.concatI32(event.logIndex.toI32())
    let claim = new Claim(claimId)

    claim.packet = packet.id
    claim.claimer = event.params.claimer
    claim.amount = event.params.amount
    claim.timestamp = event.block.timestamp
    claim.txHash = event.transaction.hash

    claim.save()
  }
}
