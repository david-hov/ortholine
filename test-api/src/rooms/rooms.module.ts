import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

import { Rooms } from './schemas/rooms.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Rooms,
      Doctors,
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule { }
