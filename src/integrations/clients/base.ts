import { IntegrationInterface } from '../types'
import { PrismaClient } from '@prisma/client'
import { EventBusInterface, TodoEventInterface } from '../../events/events'

export abstract class AbstractClient implements IntegrationInterface {
    name: string

    abstract enabled(): boolean
    abstract pull(prisma: PrismaClient, eventBus: EventBusInterface): Promise<number>
    abstract push(prisma: PrismaClient, eventBus: EventBusInterface, event: TodoEventInterface): Promise<boolean>

    logInfo(str: string) {
        console.log(`[Integrations] ${this.name} ${str}`)
    }
}