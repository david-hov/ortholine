import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinTable,
} from "typeorm";

import { Insurance } from "../../insurance/schemas/insurance.entity";

@Entity('priceLists')
export class PriceLists {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string

    @Column({ nullable: true })
    price: number

    @ManyToOne(() => Insurance, (insurance) => insurance.priceLists, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    @JoinTable()
    insurance: Insurance

    @CreateDateColumn({ nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ nullable: true })
    updatedAt: Date;
}