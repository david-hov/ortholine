import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { Doctors } from "../../doctors/schemas/doctors.entity";

@Entity('laboratories')
export class Laboratories {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @ManyToOne(() => Doctors, (doctors) => doctors.laboratories, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}