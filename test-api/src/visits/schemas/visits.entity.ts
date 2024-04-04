import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Doctors } from "../../doctors/schemas/doctors.entity";
import { Insurance } from "../../insurance/schemas/insurance.entity";
import { Clients } from "../../clients/schemas/clients.entity";
import { Attachments } from "../../attachments/schemas/attachments.entity";
import { Treatments } from "./treatments.entity";
import { SuperNotifications } from "../../superNotifications/schemas/superNotifications.entity";
import { Fee } from "./fee.entity";
import { ClientsTemplates } from "../../clientsTemplates/schemas/clientsTemplates.entity";

export enum VisitStatus {
    NOTCAME = 'notCame',
    CAME = 'came',
    LATE = 'late',
}

@Entity('visits')
export class Visits {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, default: 0 })
    xRayPrice: number

    @Column({ nullable: true })
    price: number

    @Column({ nullable: true })
    xRayCount: number

    @Column({ nullable: true })
    xRayCountInsurance: number

    @Column({ nullable: true })
    xRayCountInsuranceByDoctor: number

    @Column({ nullable: true, default: false })
    closeXRayCountInsurance: boolean

    @Column({ nullable: true })
    info: string

    @Column({
        type: 'enum',
        enum: VisitStatus,
        nullable: true,
    })
    lastVisitChecked: VisitStatus

    @Column({ nullable: true })
    fee: number

    @Column({ nullable: true, default: 0 })
    balance: number

    @Column({ nullable: true, default: false })
    clientsTemplatesConfirmed: boolean

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ nullable: true, default: 0 })
    priceByDoctor: number

    @Column({ nullable: true })
    xRayCountByDoctor: number

    @Column({ nullable: true, default: false })
    notifyAdminAboutPrice: boolean

    @Column({ nullable: true, default: false })
    callClient: boolean

    @Column({ nullable: true })
    googleCalendarEventId: string

    @Column({ nullable: true, default: false })
    callLab: boolean

    @Column({ nullable: true, default: false })
    treatmentsFilled: boolean

    @OneToMany(() => Attachments, (attachments) => attachments.visitAttachment)
    visitAttachment: Attachments[]

    @OneToMany(() => Treatments, (treatments) => treatments.visits)
    treatments: Treatments[]

    @OneToMany(() => SuperNotifications, (superNotifications) => superNotifications.visits)
    notification: SuperNotifications[]

    @OneToMany(() => Fee, (fee) => fee.visitsFees)
    feeHistory: Fee[]

    @ManyToOne(() => Clients, (clients) => clients.visits, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    clients: Clients

    @ManyToOne(() => Doctors, (doctors) => doctors.visits, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors

    @ManyToOne(() => Insurance, (insurance) => insurance.visits, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    insurance: Insurance

    @ManyToOne(() => ClientsTemplates, (clientsTemplates) => clientsTemplates.visits, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    clientsTemplates: ClientsTemplates

    @Column({ nullable: true, default: false })
    isDeleted: boolean

    @Column({ nullable: true, default: false })
    isClosedRequest: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}