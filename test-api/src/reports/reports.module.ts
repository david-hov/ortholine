import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { AttachmentsModule } from '../attachments/attachments.module';
import { Laboratories } from '../laboratories/schemas/laboratories.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { Reports } from './schemas/reports.entity';
import { Salaries } from '../salaries/schemas/salaries.entity';
import { Treatments } from '../visits/schemas/treatments.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Doctors,
            Visits,
            Laboratories,
            Fee,
            Reports,
            Salaries,
            Treatments,
            Salaries,
        ]),
        AttachmentsModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }
