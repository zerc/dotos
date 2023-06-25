import { PrismaClient } from "@prisma/client"
import { EventBusInterface, TodoEventInterface } from "../events/events"

export interface IntegrationInterface {
    readonly name: string

    enabled(): boolean
    pull(prisma: PrismaClient, eventBus: EventBusInterface): Promise<number>
    push(prisma: PrismaClient, eventBus: EventBusInterface, event: TodoEventInterface): Promise<boolean>
}