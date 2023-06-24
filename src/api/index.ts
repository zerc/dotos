import "reflect-metadata"
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSchema } from "type-graphql";
import { Context } from "../context.js";
import { resolvers } from "./resolvers/index.js";

const schema = await buildSchema({
    resolvers,
    validate: false,
});

const StartServer = async (context: Context) => {
    const server = new ApolloServer<Context>({
        schema: schema
    });

    startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async () => context
    }).then(({ url }) => console.log(`🚀  Server ready at: ${url}`));
}

export default StartServer