import { Field, ObjectType, ID } from 'type-graphql'
import { Todo } from './todo.js'

@ObjectType()
export class Category {
  @Field(() => ID)
  id: string

  @Field(() => String)
  name: string

  createdAt: Date

  @Field(() => [Todo], { nullable: true })
  todos?: Todo[]
}
