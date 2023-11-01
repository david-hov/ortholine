import { Visits } from "../../visits/schemas/visits.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    Index,
} from "typeorm";
import { Attachments } from "../../attachments/schemas/attachments.entity";
import { ClientsTemplates } from "../../clientsTemplates/schemas/clientsTemplates.entity";
import { Treatments } from "../../visits/schemas/treatments.entity";
import { SuperNotifications } from "../../superNotifications/schemas/superNotifications.entity";
import { Deposits } from "../../deposits/schemas/deposits.entity";

export enum ClientsStatus {
    FINISHED = 'finished',
    NOTFINISHED = 'notFinished',
    NEEDTOCALL = 'needToCall',
}

@Entity('clients')
export class Clients {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    nameForClientView: string

    @Column({ nullable: true, unique: true })
    number: string

    @Column({ nullable: true })
    healthStatus: string

    @Column({ nullable: true, default: 0 })
    deposit: number

    @Column({ nullable: true, default: 0 })
    balance: number

    @Column({ type: 'date', nullable: true })
    birthDate: string;

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    extraInfo: Array<any>;

    @Column({ nullable: true, default: false })
    orthodontia: boolean

    @Column({ nullable: true, default: false })
    orthopedia: boolean

    @Column({ nullable: true, default: false })
    implant: boolean

    @Index()
    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    diagnosis: Array<{ diagnose: string, payingOff: string, insurance: string, closedOrNot: boolean, date: Date }>;

    @Index()
    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    future: Array<{ text: string, date: Date }>;

    @Column({ nullable: true })
    notes: string

    @Column({ nullable: true })
    complaint: string

    @OneToMany(() => Visits, (visits) => visits.clients)
    visits: Visits[]

    @OneToMany(() => Treatments, (treatments) => treatments.clientsTreatment)
    treatments: Treatments[]

    @OneToMany(() => Deposits, (deposits) => deposits.clients)
    clientsDeposits: Deposits[]

    @ManyToOne(() => ClientsTemplates, (clientsTemplates) => clientsTemplates.clients, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    clientsTemplates: ClientsTemplates

    @OneToMany(() => Attachments, (attachments) => attachments.clientAttachment)
    clientAttachment: Attachments[]

    @OneToMany(() => SuperNotifications, (superNotifications) => superNotifications.visits)
    notification: SuperNotifications[]

    @Column({
        type: 'enum',
        enum: ClientsStatus,
        nullable: true,
        default: ClientsStatus['FINISHED']
    })
    isFinished: ClientsStatus

    @Column({ nullable: true, default: false })
    isWaiting: boolean

    @Column({ nullable: true, default: false })
    isDeleted: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}