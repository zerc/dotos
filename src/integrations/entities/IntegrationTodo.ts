import * as _ from "lodash-es";

import { Entity, PrimaryColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity()
@Index(["externalId", "integrationName"], { unique: true })
export class IntegrationTodo extends BaseEntity {
    @PrimaryColumn()
    externalId: string

    @Column()
    integrationName: string

    @Index()
    @Column({ nullable: true })
    internalId: string

    @Column({ type: "text" })
    text: string

    @Column()
    completed: boolean

    @Column({ default: false })
    inSync: boolean

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}