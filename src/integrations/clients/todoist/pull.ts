import * as _ from 'lodash-es'
import * as runtime from '@prisma/client/runtime/library'
import { v4 as uuidv4 } from 'uuid'
import { TodoistV9Types } from "todoist"
import { IntegrationTodo, PrismaClient } from '@prisma/client'

export interface ProcessItemsInterface {
    tx: Omit<PrismaClient, runtime.ITXClientDenyList>,
    items: TodoistV9Types.Item[],
    clientName: string,
}

interface ProcessedItem {
    created: boolean,
    changed: boolean,
    item: IntegrationTodo,
}


/*
 * Iterate over pulled (presumably updated) items from the service.
 * Compare their state from what stored on our side and:
 *  - If item does not exist locally - assume it's a new one
 *  - If it does exist but updates happened - assume we just published its update in a separate process
 *  - Otherwise - assume we received and update
 */
export const SyncPulledItems = async ({ tx, items, clientName }: ProcessItemsInterface): Promise<ProcessedItem[]> => {
    return Promise.all(_.map(items, async (item) => {
        const prospectId = uuidv4()
        const date = new Date()
        const todo = await tx.integrationTodo.upsert({
            where: {
                externalId_integrationName: {
                    externalId: item.id,
                    integrationName: clientName
                },
            },
            update: {
                text: item.content,
                completed: !_.isNil(item.completed_at),
                lastSyncedAt: date,
            },
            create: {
                externalId: item.id,
                internalId: prospectId,
                text: item.content,
                completed: !_.isNil(item.completed_at),
                integrationName: clientName,
                lastSyncedAt: date,
            }
        })

        const created = todo.internalId === prospectId
        const changed = created || item.content !== todo.text || !_.isNil(item.completed_at) === todo.completed

        return {
            created: created,
            changed: changed,
            item: todo
        }
    }))
}