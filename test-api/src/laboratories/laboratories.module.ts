import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { LaboratoriesController } from './laboratories.controller';
import { LaboratoriesService } from './laboratories.service';

import { Laboratories } from './schemas/laboratories.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Laboratories,
      Visits,
      Doctors,
    ]),
  ],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
  exports: [LaboratoriesService],
})
export class LaboratoriesModule { }
