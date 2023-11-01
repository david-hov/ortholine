import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
} from "typeorm";

import { Clients } from "../../clients/schemas/clients.entity";
import { Doctors } from "../../doctors/schemas/doctors.entity";
import { DoctorSalaries } from "../../doctorSalaries/schemas/doctorSalaries.entity";
import { Visits } from "../../visits/schemas/visits.entity";

@Entity('clientsTemplates')
export class ClientsTemplates {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @ManyToOne(() => Doctors, (doctors) => doctors.clientsTemplates, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors

    @Column({ nullable: true, default: 0 })
    percentage: number

    @OneToMany(() => Clients, (clients) => clients.clientsTemplates)
    clients: Clients[]

    @OneToMany(() => Visits, (visits) => visits.clientsTemplates)
    visits: Visits[]

    @OneToMany(() => DoctorSalaries, (doctorSalaries) => doctorSalaries.clientsTemplates)
    doctorSalaries: DoctorSalaries[]

    @Column({ nullable: true, default: 0 })
    confirmed: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}