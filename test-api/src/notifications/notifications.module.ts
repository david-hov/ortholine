import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

import { AppGateway } from '../app.gateway';
import { Clients } from '../clients/schemas/clients.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Roles } from '../auth/schemas/roles.entity';
import { Treatments } from '../visits/schemas/treatments.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Clients,
            Visits,
            Roles,
            Treatments,
        ]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, AppGateway],
    exports: [NotificationsService],
})
export class NotificationsModule { }
