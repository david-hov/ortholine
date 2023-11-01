import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SalariesController } from './salaries.controller';
import { SalariesService } from './salaries.service';

import { Salaries } from './schemas/salaries.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { AppGateway } from '../app.gateway';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Salaries,
            Doctors,
            Visits,
            Treatments,
            Fee,
            DoctorSalaries,
        ]),
    ],
    controllers: [SalariesController],
    providers: [SalariesService, AppGateway],
    exports: [SalariesService],
})
export class SalariesModule { }
