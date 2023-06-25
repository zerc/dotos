import * as _ from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import { Prisma, PrismaClient } from '@prisma/client'
import { EventBusInterface, TodoEventInterface } from '../../../events/events.js'
import { Todoist } from 'todoist'
import { TODOIST_TOKEN } from '../../config.js'
import { AbstractClient } from '../base.js'
import { SyncPulledItems } from './pull.js'


class TodoistIntegration extends AbstractClient {
    readonly name: string = 'todoist'

    enabled(): boolean {
        return !_.isNil(TODOIST_TOKEN)
    }

    async pull(prisma: PrismaClient, eventBus: EventBusInterface): Promise<number> {
        const client = Todoist(TODOIST_TOKEN)
        const refreshToken = await prisma.regreshToken.findUnique({
            where: {
                integrationName: this.name
            }
        })

        if (!_.isNil(refreshToken)) {
            client.syncToken.set(refreshToken.token)
        }

        await client.sync(["items"])

        const items = client.items.get()
        const count = items.length

        await prisma.$transaction(async (tx) => {
            const processedItems = await SyncPulledItems({ tx, items, clientName: this.name })

            _.forEach(processedItems, ({ created, changed, item }) => {
                const request = {
                    id: uuidv4(),
                    source: this.name,
                    timestamp: new Date(),
                    payload: {
                        id: item.internalId,
                        text: item.text,
                        completed: item.completed,
                    }
                }

                if (created) {
                    eventBus.todoCreated(request)
                } else if (changed) {
                    eventBus.todoUpdated(request)
                }
            })

            await tx.regreshToken.upsert({
                where: { integrationName: this.name },
                update: { token: client.syncToken.get() },
                create: { token: client.syncToken.get(), integrationName: this.name }
            })
        });

        this.logInfo(`synced ${count} items`)

        return count
    }

    async push(prisma: PrismaClient, eventBus: EventBusInterface, event: TodoEventInterface): Promise<boolean> {
        const client = Todoist(TODOIST_TOKEN)

        await prisma.$transaction(async (tx) => {
            const todo = await tx.integrationTodo.findFirst({
                where: { internalId: event.payload.id, integrationName: this.name }
            })

            // Client received a new item - store the relation and create the external resouce.
            if (_.isNil(todo)) {
                const item = await client.items.add({
                    'content': event.payload.text,
                })

                await tx.integrationTodo.create({
                    data: {
                        externalId: item.id,
                        internalId: event.payload.id,
                        integrationName: this.name,
                        text: event.payload.text,
                        completed: event.payload.completed,
                        lastSyncedAt: undefined
                    }
                })

                return
            }

            // It's know item and the event received is fresh - update and sync
            if (todo.lastSyncedAt < event.timestamp) {
                await tx.integrationTodo.update({
                    where: {
                        externalId_integrationName: {
                            externalId: todo.externalId,
                            integrationName: todo.integrationName,
                        },
                    },
                    data: {
                        text: event.payload.text,
                        completed: event.payload.completed,
                        lastSyncedAt: event.timestamp,
                    }
                })

                if (todo.text !== event.payload.text) {
                    await client.items.update({
                        id: todo.externalId,
                        content: event.payload.text,
                    })
                }

                if (event.payload.completed) {
                    await client.items.complete({
                        id: todo.externalId,
                        completed_at: event.timestamp.toISOString()
                    })
                } else if (!event.payload.completed && todo.completed) {
                    await client.items.uncomplete({
                        id: todo.externalId,
                    })
                }
                return
            }
        }, {
            // TODO: retry the transaction when conflict happens!
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        });

        return true
    }
}

export const todoistInt = new TodoistIntegration()
