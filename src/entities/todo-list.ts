import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, BaseEntity, Relation } from 'typeorm';
import { Todo } from './todo.js';
import { Field, ObjectType, ID } from "type-graphql";

@Entity()
@ObjectType()
export class TodoList extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string;

    @Column({ length: 150 })
    @Field(() => String)
    name: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Field(() => [Todo])
    @OneToMany(() => Todo, (todo) => todo.todoList)
    todos: Relation<Todo[]>;
}