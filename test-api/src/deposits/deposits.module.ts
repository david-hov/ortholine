import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DepositsController } from './deposits.controller';
import { DepositsService } from './deposits.service';

import { Deposits } from './schemas/deposits.entity';
import { Clients } from '../clients/schemas/clients.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Deposits,
            Clients,
        ]),
    ],
    controllers: [DepositsController],
    providers: [DepositsService],
    exports: [DepositsService],
})
export class DepositsModule { }
