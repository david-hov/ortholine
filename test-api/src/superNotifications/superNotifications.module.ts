import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SuperNotificationsController } from './superNotifications.controller';
import { SuperNotificationsService } from './superNotifications.service';

import { SuperNotifications } from './schemas/superNotifications.entity';
import { AppGateway } from '../app.gateway';
import { Visits } from '../visits/schemas/visits.entity';
import { Clients } from '../clients/schemas/clients.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            SuperNotifications,
            Visits,
            Clients,
        ]),
    ],
    controllers: [SuperNotificationsController],
    providers: [SuperNotificationsService, AppGateway],
    exports: [SuperNotificationsService],
})
export class SuperNotificationsModule { }
