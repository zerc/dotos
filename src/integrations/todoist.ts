import { isNil, isNull, map } from "lodash-es"
import { Todoist, TodoistV9Types } from "todoist"
import { EntityManager, EntitySubscriberInterface, EventSubscriber, InsertEvent, TransactionCommitEvent, UpdateEvent } from "typeorm"
import { AppDataSource } from "../data-source.js"
import { IntegrationTodo } from "./entities/IntegrationTodo.js"
import { RefreshToken } from "./entities/RefreshToken.js"
import config from "../config.js"
import { Todo } from "../entities/todo.js"


AppDataSource.initialize().catch((error) => console.error("Error: ", error))


const Sync = async () => {
    console.log(config.TODOIST_TOKEN)
    const token = await RefreshToken.findOneBy({ integrationName: "todoist" }) || new RefreshToken()
    const client = Todoist(config.TODOIST_TOKEN)

    if (!isNull(token.token)) {
        client.syncToken.set(token.token)
    }

    await client.sync(["items"])

    await AppDataSource.transaction(async (manager) => {
        const items = client.items.get()

        await UpdateOrCreate(items, manager)

        console.log("Sync token: ", client.syncToken.get())
        token.integrationName = "todoist"
        token.token = client.syncToken.get()
        await manager.save(token)
    })

    await UpdateRelated()

    await AppDataSource.transaction(async (manager) => {
        const items = await manager.findBy(IntegrationTodo, { inSync: false, integrationName: "todoist" })

        console.log("Runner: ", manager.queryRunner.isReleased)

        await Promise.all(map<IntegrationTodo>(items, async (item) => {
            console.log("Runner 2: ", manager.queryRunner.isReleased)
            if (isNil(item.internalId)) {
                // Create a new item
                const todo = new Todo()
                todo.text = item.text
                todo.completedAt = item.completed ? new Date() : null
                await manager.save(todo)

                item.internalId = todo.id
                item.inSync = true
                await manager.save(item)
            } else {
                // Update
                const todo = await manager.findOneBy(Todo, { id: item.internalId })

                if (isNil(todo)) {
                    console.error("Missing internal object with ID ", item.internalId)
                    return false
                }

                if (todo.updatedAt <= item.updatedAt) {
                    // Outdated - let's sync
                    todo.text = item.text
                    todo.completedAt = item.completed ? new Date() : null

                    await manager.save(todo)
                    console.log("Updated internal item with ID", todo.id)
                } else {
                    console.log(`Local copy of ${todo.id} is fresh enough - do not update`)
                }

                item.inSync = true
                await manager.save(item)
            }

            return true
        }))
    })
}

const UpdateRelated = async () => {

}

const UpdateOrCreate = async (items: TodoistV9Types.Item[], manager: EntityManager) => {
    const upsert = map<TodoistV9Types.Item, {
        integrationName: string,
        externalId: string,
        text: string,
        completed: boolean,
        inSync: boolean
    }>(items, (item) => {
        return {
            "integrationName": "todoist",
            "externalId": item.id,
            "text": item.content,
            "completed": !isNil(item.completed_at),
            "inSync": false
        }
    })
    const result = await manager.upsert(IntegrationTodo, upsert, ["externalId", "integrationName"])
    console.log("Result identifiers: ", result.identifiers)
    console.log("Result maps: ", result.generatedMaps)
}

const intervalID = setInterval(Sync, 1000 * 3)

process.on('SIGINT', function () {
    console.log("Caught interrupt signal - stopping the worker gracefully");
    clearInterval(intervalID)
});