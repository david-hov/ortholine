import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
} from 'typeorm';
import { Roles } from './roles.entity';
import { Doctors } from '../../doctors/schemas/doctors.entity';

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    email: string;

    @Column({nullable: true})
    googleToken: string;

    @ManyToOne(() => Roles, (users) => users.user, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    })
    roles: Roles

    @ManyToOne(() => Doctors, (doctors) => doctors.users, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    doctors: Doctors
}
