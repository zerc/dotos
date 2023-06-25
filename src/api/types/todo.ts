import * as _ from 'lodash-es'
import { Field, ObjectType, ID } from 'type-graphql'
import { Category } from './category.js'

@ObjectType()
export class Todo {
  @Field(() => ID)
  id: string

  @Field(() => String)
  text: string

  @Field(() => Date)
  createdAt: Date

  @Field(() => Category, { nullable: true })
  category?: Category

  @Field(() => Boolean, { nullable: true })
  completed?: false

  updatedAt: Date
  completedAt: Date
}
