import {
  PacketClaimed as PacketClaimedEvent,
  PacketCreated as PacketCreatedEvent
} from "../generated/RedPacket/RedPacket"
import { PacketClaimed, PacketCreated } from "../generated/schema"

export function handlePacketClaimed(event: PacketClaimedEvent): void {
  let entity = new PacketClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.claimer = event.params.claimer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePacketCreated(event: PacketCreatedEvent): void {
  let entity = new PacketCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.internal_id = event.params.id
  entity.creator = event.params.creator
  entity.totalAmount = event.params.totalAmount
  entity.count = event.params.count
  entity.packetType = event.params.packetType

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
