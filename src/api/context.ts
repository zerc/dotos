import { PrismaClient } from "@prisma/client";
import { EventBusInterface } from "../events/events";

export interface Context {
    prisma: PrismaClient
    eventBus: EventBusInterface
}