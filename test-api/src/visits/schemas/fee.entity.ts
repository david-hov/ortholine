import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";
import { Visits } from "./visits.entity";

@Entity('fee', {
    orderBy: {
        id: 'DESC'
    }
})
export class Fee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    feeValue: number

    @Column({ nullable: true })
    date: Date

    @Column({ nullable: true, default: false })
    feeSentToDoctor: boolean

    @Column({ nullable: true, default: false })
    feeSentToSalary: boolean

    @ManyToOne(() => Visits, (visits) => visits.fee, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    visitsFees: Visits

    @Column({ nullable: true })
    feeSentForSalaryDate: Date

    @Column({ nullable: true })
    currentBalance: number

    @Column({ nullable: true, default: true })
    isCash: boolean

    @Column({ nullable: true, default: false })
    fromClinic: boolean

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}