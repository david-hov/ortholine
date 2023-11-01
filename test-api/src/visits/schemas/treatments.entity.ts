import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Insurance } from "../../insurance/schemas/insurance.entity";
import { Clients } from "../../clients/schemas/clients.entity";
import { PriceLists } from "../../priceLists/schemas/priceLists.entity";
import { Visits } from "./visits.entity";
import { Doctors } from "../../doctors/schemas/doctors.entity";

@Entity('treatments')
export class Treatments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    treatmentName: string

    @Column({ nullable: true, default: 0 })
    realPriceForTreatment: number

    @Column({ nullable: true, default: 0 })
    payingPriceForTreatment: number

    @Column({ nullable: true, default: 0 })
    discountForTreatment: number

    @ManyToOne(() => Insurance, (insurance) => insurance.visits, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    insuranceForTreatment: Insurance

    @Column({ nullable: true, default: 0 })
    insurancePriceForTreatment: number

    @ManyToOne(() => Visits, (visits) => visits.treatments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    visits: Visits

    @ManyToOne(() => Clients, (clients) => clients.treatments, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    clientsTreatment: Clients

    @ManyToOne(() => Doctors, (doctors) => doctors.treatments, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    doctorsTreatment: Doctors

    @ManyToMany(() => PriceLists, (priceLists) => priceLists, {
        cascade: true,
    })
    @JoinTable()
    priceListsForOneTreatment: PriceLists[]

    @Column({ nullable: true, default: false })
    closedInsuranceStatus: boolean

    @Column({ nullable: true, default: false })
    insuranceSalarySentToDoctor: boolean

    @Column({ nullable: true, default: false })
    insuranceSentForSalary: boolean

    @Column({ nullable: true })
    insuranceSentForSalaryDate: Date

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}