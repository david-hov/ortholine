import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { InsuranceController } from './insurance.controller';
import { InsuranceService } from './insurance.service';

import { Insurance } from './schemas/insurance.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Insurance,
            Attachments,
            Visits,
            Treatments,
            DoctorSalaries,
        ]),
    ],
    controllers: [InsuranceController],
    providers: [InsuranceService],
    exports: [InsuranceService],
})
export class InsuranceModule { }
