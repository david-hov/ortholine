import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
} from "typeorm";

import { Clients } from "../../clients/schemas/clients.entity";
import { Visits } from "../../visits/schemas/visits.entity";


@Entity('attachments')
export class Attachments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column( {nullable: true})
    src: string

    @Column( {nullable: true})
    thumbnail: string

    @Column( {nullable: true})
    type: string

    @ManyToOne(() => Clients, clients => clients.clientAttachment, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    clientAttachment: Clients

    @ManyToOne(() => Visits, visits => visits.visitAttachment, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    visitAttachment: Visits

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}