import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import { Doctors } from "../../doctors/schemas/doctors.entity";
import { Insurance } from "../../insurance/schemas/insurance.entity";
import { Salaries } from "../../salaries/schemas/salaries.entity";
import { ClientsTemplates } from "../../clientsTemplates/schemas/clientsTemplates.entity";

@Entity('doctorSalaries')
export class DoctorSalaries {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, default: 0 })
    price: number

    @Column({ nullable: true, default: false })
    special: boolean

    @Column({ nullable: true, default: 0 })
    specialPercentage: number

    @ManyToOne(() => Insurance, (insurance) => insurance.doctorSalaries, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    insurance: Insurance

    @ManyToOne(() => Doctors, (doctors) => doctors.doctorSalaries, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors

    @ManyToOne(() => ClientsTemplates, (clientsTemplates) => clientsTemplates.doctorSalaries, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    clientsTemplates: ClientsTemplates

    @ManyToOne(() => Salaries, (salaries) => salaries.doctorSalaries, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    salaries: Salaries

    @Column({ nullable: true, default: false })
    salarySent: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}