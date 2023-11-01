import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DoctorSalariesController } from './doctorSalaries.controller';
import { DoctorSalariesService } from './doctorSalaries.service';

import { DoctorSalaries } from './schemas/doctorSalaries.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            DoctorSalaries,
            Doctors,
            Insurance,
            ClientsTemplates,
        ]),
    ],
    controllers: [DoctorSalariesController],
    providers: [DoctorSalariesService],
    exports: [DoctorSalariesService],
})
export class DoctorSalariesModule { }
