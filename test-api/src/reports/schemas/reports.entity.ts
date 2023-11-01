import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from "typeorm";

import { Salaries } from "../../salaries/schemas/salaries.entity";

@Entity('reports')
export class Reports {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    client: string

    @Column({ nullable: true })
    doctor: string

    @Column({ nullable: true })
    servicePrice: number

    @Column({ nullable: true })
    insurancePrice: number

    @Column({ nullable: true })
    insuranceName: string

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
    })
    feeHistory: Array<{ date: any, fee: number, balance: number }>;

    @Column({ nullable: true })
    xRayCount: number

    @OneToOne(() => Salaries)
    @JoinColumn()
    salary: Salaries

    @Column({ nullable: true })
    date: Date;

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}