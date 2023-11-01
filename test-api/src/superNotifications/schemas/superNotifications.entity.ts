import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { Visits } from "../../visits/schemas/visits.entity";
import { Clients } from "../../clients/schemas/clients.entity";

@Entity('supernotifications')
export class SuperNotifications {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title: string

    @Column({ nullable: true, default: 0 })
    prevValue: string

    @Column({ nullable: true, default: 0 })
    currentValue: string

    @ManyToOne(() => Visits, (visits) => visits.notification, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    visits: Visits

    @ManyToOne(() => Clients, (clients) => clients.notification, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    clients: Clients

    @Column({ nullable: true })
    date: Date;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}