import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class Settings {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({nullable: true, default: 0})
    xRayPrice: number

    @Column({
        length: 500
    })
    printDetailsInfo: string;

    @Column({ nullable: true })
    companyName: string

    @Column({ nullable: true, default: 'Անուն ազգանուն' })
    companyDirector: string

    @Column({ nullable: true })
    companyImage: string

    @CreateDateColumn({ nullable: true })
    createdAt: Date;
}
