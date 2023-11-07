import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
} from "typeorm";
import { Visits } from "../../visits/schemas/visits.entity";
import { Rooms } from "../../rooms/schemas/rooms.entity";
import { Users } from "../../auth/schemas/users.entity";
import { Treatments } from "../../visits/schemas/treatments.entity";
import { ClientsTemplates } from "../../clientsTemplates/schemas/clientsTemplates.entity";
import { DoctorSalaries } from "../../doctorSalaries/schemas/doctorSalaries.entity";

@Entity('doctors')
export class Doctors {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    shortName: string

    @Column({ nullable: true })
    color: string

    @Column({ nullable: true })
    calendarId: string

    @Column({ nullable: true })
    percentage: number

    @Column({ nullable: true })
    sum: number

    @Column({ default: false })
    vacation: boolean

    @Column({ nullable: true })
    startVacation: Date

    @Column({ nullable: true })
    endVacation: Date

    @OneToMany(() => DoctorSalaries, (doctorSalaries) => doctorSalaries.doctors)
    doctorSalaries: DoctorSalaries[]

    @OneToMany(() => Doctors, (doctors) => doctors.salaries)
    salaries: Doctors[]

    @OneToMany(() => Visits, (visits) => visits.doctors)
    visits: Visits[]

    @OneToMany(() => Treatments, (treatments) => treatments.doctorsTreatment)
    treatments: Treatments[]

    @OneToMany(() => ClientsTemplates, (clientsTemplates) => clientsTemplates.doctors)
    clientsTemplates: ClientsTemplates[]

    @OneToMany(() => Users, (users) => users.doctors)
    users: Users[]

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    laboratories: Array<{ insurance: number, price: number }>;

    @ManyToOne(() => Rooms, (rooms) => rooms.doctors, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    rooms: Rooms

    @Column({ nullable: true, default: false })
    isDeleted: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}