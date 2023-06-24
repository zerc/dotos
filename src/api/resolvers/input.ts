import { InputType, Field, registerEnumType } from "type-graphql";

export enum SortOrder {
    asc = 'asc',
    desc = 'desc',
}

@InputType()
export class OrderByCreatedAt {
    @Field(() => SortOrder)
    createdAt: SortOrder
}