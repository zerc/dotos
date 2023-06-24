import { registerEnumType } from "type-graphql"
import { TodoResolver } from "./todo.js"
import { CategoryResolver } from "./category.js"
import { SortOrder } from "./input.js"

export const resolvers = [CategoryResolver, TodoResolver] as const

registerEnumType(SortOrder, {
    name: 'SortOrder',
})
