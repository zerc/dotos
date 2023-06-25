import { ArgsType, Field, Int } from 'type-graphql'
import { OrderByCreatedAt, SortOrder } from './input.js'
import { Min } from 'class-validator'

@ArgsType()
export class DefaultListArgs {
  @Field((type) => String, { nullable: true })
  searchString: string

  @Field((type) => Int, { defaultValue: 0 })
  @Min(0)
  skip: number

  @Field((type) => Int, { nullable: true })
  @Min(0)
  take: number

  @Field({ defaultValue: { createdAt: SortOrder.desc } })
  orderBy: OrderByCreatedAt
}
