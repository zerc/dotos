import * as _ from "lodash-es"

import { Query, Resolver, Mutation, Arg, Int, Ctx, Args, FieldResolver, Root } from "type-graphql";
import { Category } from "../types/category.js";
import { Context } from "../../context.js";
import { DefaultListArgs } from "./arguments.js";
import { Todo } from "../types/todo.js";


@Resolver(Category)
export class CategoryResolver {
    @FieldResolver()
    async todos(@Root() category: Category, @Ctx() ctx: Context): Promise<Todo[] | null> {
        return ctx.prisma.category.findUnique({
            where: {
                id: category.id,
            },
        }).todos()
    }

    @Query(() => [Category])
    async listCategory(
        @Args() { searchString, skip, take, orderBy }: DefaultListArgs,
        @Ctx() ctx: Context,
    ) {
        const search = searchString
            ? {
                name: { contains: searchString }
            }
            : {}

        return ctx.prisma.category.findMany({
            where: {
                ...search,
            },
            take: take || undefined,
            skip: skip || undefined,
            orderBy: orderBy || undefined,
        })
    }

    @Query(() => Category, { nullable: true })
    async getCategory(@Arg('id') id: string, @Ctx() ctx: Context) {
        return ctx.prisma.category.findUnique({
            where: { id },
        })
    }

    @Mutation(() => Category)
    async createCategory(
        @Arg('name') name: string,
        @Ctx() ctx: Context,
    ) {
        return ctx.prisma.category.create({
            data: { name }
        })
    }
}