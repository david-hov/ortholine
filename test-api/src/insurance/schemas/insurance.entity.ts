import { Visits } from "../../visits/schemas/visits.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { PriceLists } from "../../priceLists/schemas/priceLists.entity";
import { Treatments } from "../../visits/schemas/treatments.entity";
import { DoctorSalaries } from "../../doctorSalaries/schemas/doctorSalaries.entity";

@Entity('insurance')
export class Insurance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    percentage: number

    @OneToMany(() => DoctorSalaries, (doctorSalaries) => doctorSalaries.insurance)
    doctorSalaries: DoctorSalaries[]

    @OneToMany(() => Visits, (visits) => visits.insurance)
    visits: Visits[]

    @OneToMany(() => Treatments, (treatments) => treatments.insuranceForTreatment)
    treatments: Treatments[]

    @OneToMany(() => PriceLists, (priceLists) => priceLists.insurance)
    priceLists: PriceLists[]

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}