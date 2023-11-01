import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { Clients } from "../../clients/schemas/clients.entity";

@Entity('deposits')
export class Deposits {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    value: number

    @Column({ nullable: true })
    balanceMessage: string

    @Column({ nullable: true })
    inputDate: Date

    @ManyToOne(() => Clients, (clients) => clients.clientsDeposits, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    clients: Clients

    @Column({ nullable: true, default: false })
    fromClinic: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}