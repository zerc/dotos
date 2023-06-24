import * as _ from "lodash-es"

import { Query, Resolver, Mutation, Arg, Int, Ctx, Args, FieldResolver, Root } from "type-graphql";
import { Todo } from "../types/todo.js";
import { Context } from "../../context.js";
import { DefaultListArgs } from "./arguments.js";
import { Category } from "../types/category.js";


@Resolver(Todo)
export class TodoResolver {
    @FieldResolver()
    async category(@Root() todo: Todo, @Ctx() ctx: Context): Promise<Category | null> {
        return ctx.prisma.todo.findUnique({
            where: {
                id: todo.id,
            },
        }).category()
    }

    @FieldResolver()
    async completed(@Root() todo: Todo, @Ctx() ctx: Context): Promise<boolean> {
        return _.isNil(todo.completedAt) === false
    }

    @Query(() => [Todo])
    async listTodo(
        @Args() { searchString, skip, take, orderBy }: DefaultListArgs,
        @Arg("completed", { nullable: true }) completed: boolean,
        @Ctx() ctx: Context,
    ) {
        let filter: {
            text?: { contains: string },
            completedAt?: null | { not: null }
        } = {}

        if (searchString) {
            filter.text = { contains: searchString }
        }

        if (!_.isNil(completed)) {
            filter.completedAt = completed ? { not: null } : null
        }

        return ctx.prisma.todo.findMany({
            where: _.isEmpty(filter) ? undefined : filter,
            take: take || undefined,
            skip: skip || undefined,
            orderBy: orderBy || undefined,
        })
    }

    @Query(() => Todo, { nullable: true })
    async getTodo(
        @Arg('id') id: string,
        @Ctx() ctx: Context
    ) {
        return ctx.prisma.todo.findUnique({
            where: { id },
        })
    }

    @Mutation(() => Todo)
    async createTodo(
        @Arg('text') text: string,
        @Arg('categoryId', { nullable: true }) categoryId: string,
        @Ctx() ctx: Context,
    ) {
        return ctx.prisma.todo.create({
            data: {
                text: text,
                categoryId: categoryId
            },
            include: {
                category: true
            }
        })
    }

    @Mutation(() => Todo, { nullable: true })
    async updateTodo(
        @Arg('id') id: string,
        @Arg('text', { nullable: true }) text: string,
        @Arg('complete', { nullable: true }) complete: boolean,
        @Ctx() ctx: Context,
    ) {
        let data: { completedAt?: Date, text?: string } = {}

        if (!_.isNil(complete)) {
            data.completedAt = complete ? new Date() : null
        }

        if (!_.isNil(text)) {
            data.text = text
        }

        if (_.isEmpty(data)) {
            throw Error('Nothing to update')
        }

        const item = await ctx.prisma.todo.findUnique({
            where: { id },
        })

        return ctx.prisma.todo.update({
            where: { id },
            data: data
        })
    }
}