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
import { DoctorSalaries } from "../../doctorSalaries/schemas/doctorSalaries.entity";

@Entity('salaries')
export class Salaries {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    laboratories: Array<{ insurance: number, price: number }>;

    @OneToMany(() => DoctorSalaries, (doctorSalaries) => doctorSalaries.salaries)
    doctorSalaries: DoctorSalaries[]

    @ManyToOne(() => Doctors, (doctors) => doctors.salaries, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors

    @Column({ nullable: true })
    date: Date;

    @Column({ nullable: true, default: 0 })
    sum: number

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}