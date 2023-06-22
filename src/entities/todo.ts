import * as _ from "lodash-es";

import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Relation } from "typeorm"
import { TodoList } from "./todo-list.js";
import { Field, ObjectType, ID } from "type-graphql";

@Entity()
@ObjectType()
export class Todo extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    @Field(() => ID)
    id: string

    @Column({ type: "text" })
    @Field(() => String)
    text: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    @Field(() => Date)
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date;

    @Field(() => TodoList, { nullable: true })
    @ManyToOne(() => TodoList, (todoList) => todoList.todos)
    @JoinColumn({ name: 'todoListId' })
    todoList: Relation<TodoList>;

    @Field(() => Boolean)
    completed(): boolean {
        return _.isNil(this.completedAt) === false
    }
}