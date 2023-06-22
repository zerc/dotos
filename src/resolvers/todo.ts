import { Todo } from "../entities/todo.js";
import { Query, Resolver, Mutation, Arg, ID, Root, FieldResolver, ResolverInterface } from "type-graphql";
import * as _ from "lodash-es"
import { TodoList } from "../entities/todo-list.js";


@Resolver(of => Todo)
export class TodoResolver implements ResolverInterface<Todo> {
    @FieldResolver()
    todoList(@Root() todo: Todo) {
        return todo.todoList
    }

    @Query(() => [Todo])
    async todos(): Promise<Todo[]> {
        return await Todo.find();
    }

    @Query(() => Todo, { nullable: true })
    async todo(@Arg("id", () => ID) id: string): Promise<Todo | null> {
        return await Todo.findOne({
            where: { id },
            relations: {
                todoList: true
            }
        })
    }

    @Mutation(() => Todo)
    async createTodo(
        @Arg("text", () => String) text: string,
        @Arg("listId", () => String, { nullable: true }) listId: string
    ): Promise<Todo> {
        const todo = new Todo()
        todo.text = text

        if (!_.isNil(listId)) {
            const todoList = await TodoList.findOne({ where: { id: listId } })

            if (_.isNil(todoList)) {
                throw Error("Invalid list id")
            }

            todo.todoList = todoList
        }

        await todo.save()

        return todo
    }

    @Mutation(() => Boolean)
    async deleteTodo(@Arg("id", () => ID) id: string): Promise<boolean> {
        return await (await Todo.delete(id)).affected > 0
    }

    @Mutation(() => Todo)
    async updateTodo(
        @Arg("id", () => ID) id: string,
        @Arg("text", () => String, { nullable: true }) text: string,
        @Arg("completed", () => Boolean, { nullable: true }) compelted: boolean,
        @Arg("listId", () => String, { nullable: true }) listId: string
    ): Promise<Todo | null> {
        const todo = await Todo.findOneBy({ id });

        if (_.isNil(todo)) {
            return null
        }

        if (!_.isNull(text)) {
            todo.text = text
        }

        if (!_.isNull(compelted)) {
            if (compelted) {
                todo.completedAt = new Date()
            } else {
                todo.completedAt = null
            }
        }

        if (!_.isNil(listId)) {
            const todoList = await TodoList.findOne({ where: { id: listId } })

            if (_.isNil(todoList)) {
                throw Error("Invalid list id")
            }

            todo.todoList = todoList
        }

        await todo.save()

        return todo
    }
}