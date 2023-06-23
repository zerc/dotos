
import { Entity, PrimaryColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class RefreshToken extends BaseEntity {
    @PrimaryColumn({ length: 100 })
    integrationName: string

    @Column({ type: 'text' })
    token: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}