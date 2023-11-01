import { Visits } from "../../visits/schemas/visits.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Doctors } from "../../doctors/schemas/doctors.entity";

@Entity('rooms')
export class Rooms {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @OneToMany(() => Doctors, (doctors) => doctors.rooms)
    doctors: Doctors[]

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}