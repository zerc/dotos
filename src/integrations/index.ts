import { forEach } from 'lodash-es';
import { PrismaClient } from '@prisma/client'
import { EventBusInterface, TodoEventInterface } from "../events/events.js";
import { todoistInt } from "./clients/todoist/client.js"
import { dummyInt } from "./clients/dummy.js"
import { IntegrationInterface } from './types.js';

export const Integrations: { string?: IntegrationInterface } = {}

forEach([todoistInt, dummyInt], (integration) => {
    if (integration.enabled()) {
        Integrations[integration.name] = integration
    } else {
        console.info(`[Integrations] ${integration.name} is disabled`)
    }
})

export const RegisterIntegrations = async (prisma: PrismaClient, eventBus: EventBusInterface) => {
    console.info("[Integrations]: init")

    forEach<typeof Integrations>(Integrations, (integration, name) => {
        console.info(`[Integrations] Register events for ${name}`)

        eventBus.todoCreated.on((data: TodoEventInterface) => {
            if (data.source != integration.name) {
                integration.push(prisma, eventBus, data)
                console.info(`[Integrations]: todoCreated event for ${integration.name}: `, data)
            }
        });

        eventBus.todoUpdated.on((data: TodoEventInterface) => {
            if (data.source != integration.name) {
                integration.push(prisma, eventBus, data)
                console.info(`[Integrations]: todoUpdated event for ${integration.name}: `, data)
            }
        });
    })
}

export const StartPolling = async (prisma: PrismaClient, eventBus: EventBusInterface, interval: number) => {
    const intervalId = setInterval(() => {
        forEach(Integrations, async (integration, name) => {
            await integration.pull(prisma, eventBus)
        });
    }, interval)

    process.on('SIGINT', function () {
        console.log("Caught interrupt signal - stopping the polling gracefully");
        clearInterval(intervalId)
    });

    return intervalId
}