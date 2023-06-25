import * as _ from "lodash-es"
import { PrismaClient } from "@prisma/client";
import { OrderByCreatedAt } from "../resolvers/input";
import { Todo } from "../types/todo";
import { Service, Container } from "typedi"

interface ListFilter {
    text?: { contains: string },
    completedAt?: null | { not: null }
}

interface UpdateParams {
    text?: string,
    completedAt?: Date
}

@Service()
export class TodoService {
    private readonly prisma: PrismaClient

    constructor() {
        this.prisma = Container.get('prisma')
    }

    async list({ filter, take, skip, orderBy }: {
        filter?: ListFilter,
        take?: number,
        skip?: number,
        orderBy?: OrderByCreatedAt
    }): Promise<Todo[]> {
        return this.prisma.todo.findMany({
            where: _.isEmpty(filter) ? undefined : filter,
            take: take || undefined,
            skip: skip || undefined,
            orderBy: orderBy || undefined,
        })
    }

    async get({ id }: { id: string }): Promise<Todo> {
        return this.prisma.todo.findUnique({
            where: { id },
        })
    }

    async create({ text, categoryId }: { text: string, categoryId?: string }): Promise<Todo> {
        return this.prisma.todo.create({
            data: {
                text: text,
                categoryId: categoryId
            },
        })
    }

    async update({ id, data }: {
        id: string,
        data: UpdateParams
    }): Promise<Todo> {
        const item = await this.prisma.todo.findUnique({
            where: { id },
        })

        return this.prisma.todo.update({
            where: { id: item.id },
            data: data
        })
    }

    async upsert({ id, data }: {
        id: string,
        data: UpdateParams
    }): Promise<Todo> {
        return this.prisma.todo.upsert({
            where: {
                id
            },
            create: {
                id: id,
                text: data.text,
                completedAt: data.completedAt
            },
            update: data
        })
    }
}