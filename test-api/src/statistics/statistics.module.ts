import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Clients } from '../clients/schemas/clients.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Clients,
            Doctors,
            Visits,
        ]),
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService],
})
export class StatisticsModule { }
