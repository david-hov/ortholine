import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';

import { Clients } from './schemas/clients.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { AppGateway } from '../app.gateway';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';
import { Roles } from '../auth/schemas/roles.entity';
import { AttachmentsModule } from '../attachments/attachments.module';
import { Treatments } from '../visits/schemas/treatments.entity';
import { SuperNotificationsService } from '../superNotifications/superNotifications.service';
import { SuperNotifications } from '../superNotifications/schemas/superNotifications.entity';
import { Deposits } from '../deposits/schemas/deposits.entity';
import { Fee } from '../visits/schemas/fee.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Clients,
            Attachments,
            Visits,
            ClientsTemplates,
            Roles,
            Treatments,
            SuperNotifications,
            Deposits,
            Fee,
        ]),
        AttachmentsModule,
    ],
    controllers: [ClientsController],
    providers: [ClientsService, AppGateway, SuperNotificationsService],
    exports: [ClientsService],
})
export class ClientsModule { }
