import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { PriceListsController } from './priceLists.controller';
import { PriceListsService } from './priceLists.service';

import { PriceLists } from './schemas/priceLists.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { Treatments } from '../visits/schemas/treatments.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      PriceLists,
      Treatments,
      Insurance,
    ]),
  ],
  controllers: [PriceListsController],
  providers: [PriceListsService],
  exports: [PriceListsService],
})
export class PriceListsModule { }
