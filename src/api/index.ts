import "reflect-metadata"
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone'
import { PrismaClient } from "@prisma/client";
import { buildSchema } from "type-graphql";
import { resolvers } from "./resolvers/index.js";
import { EventBusInterface } from "../events/events.js";
import { Container } from "typedi"
import { TodoService } from "./services/todo.js";
import { logInfo } from "./utils.js";


const schema = await buildSchema({
    resolvers,
    validate: false,
    container: Container
});


export const StartServer = async (prisma: PrismaClient, eventBus: EventBusInterface) => {
    const context = {
        prisma: prisma,
        eventBus: eventBus
    }

    Container.set<PrismaClient>('prisma', prisma)

    const server = new ApolloServer<typeof context>({
        schema: schema
    });

    RegisterAppReceivers(prisma, eventBus);

    startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async () => context
    }).then(({ url }) => logInfo(`🚀  Server ready at: ${url}`));
}


export const RegisterAppReceivers = (prisma: PrismaClient, eventBus: EventBusInterface) => {
    Container.set<PrismaClient>('prisma', prisma)

    const todoService = Container.get(TodoService)

    eventBus.todoCreated.on((event) => {
        if (event.source !== 'api') {
            todoService.upsert({
                id: event.payload.id,  // there is always an ID
                data: {
                    text: event.payload.text,
                    completedAt: event.payload.completed ? event.timestamp : null
                }
            })

            logInfo('todoCreated event: ', event)
        }
    });

    eventBus.todoUpdated.on((event) => {
        if (event.source !== 'api') {
            // NOTE: use upsert for the cases when sync transaction wasn't completed
            // and there is an IntegrationTodo created without corresponding Todo.
            todoService.upsert({
                id: event.payload.id,
                data: {
                    text: event.payload.text,
                    completedAt: event.payload.completed ? event.timestamp : null
                }
            })
            logInfo('todoUpdated event: ', event)
        }
    });

    logInfo('registered all receivers')
}