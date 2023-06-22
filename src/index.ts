import "reflect-metadata"
import { AppDataSource } from "./data-source.js";
import { TodoList } from "./entities/todo-list.js";
import { Todo } from "./entities/todo.js";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone'
import { TodoResolver } from "./resolvers/todo.js";
import { buildSchema } from "type-graphql";


const server = new ApolloServer({
    schema: await buildSchema({
        resolvers: [TodoResolver],
        validate: false
    }),
});


AppDataSource.initialize().then(async (dataSource) => {
    startStandaloneServer(server, {
        listen: { port: 4000 }
    }).then(({ url }) => console.log(`🚀  Server ready at: ${url}`));
    /*
    const todo = new Todo()
    todo.text = "my first ever todo"
    await todo.save()

    const list = new TodoList()
    list.name = "demo list"
    await list.save()

    const todo2 = new Todo()
    todo2.text = "boom in demo list"
    todo2.todoList = list
    await todo2.save()
    */
}).catch((error) => console.error("Error: ", error));