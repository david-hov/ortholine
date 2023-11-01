import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

import { Visits } from './schemas/visits.entity';
import { Clients } from '../clients/schemas/clients.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { AppGateway } from '../app.gateway';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { PriceLists } from '../priceLists/schemas/priceLists.entity';
import { PriceCalculationsService } from './priceCalculations.service';
import { Roles } from '../auth/schemas/roles.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { AttachmentsModule } from '../attachments/attachments.module';
import { Treatments } from './schemas/treatments.entity';
import { VisitsUtilsService } from './visitsUtils.service';
import { Settings } from '../settings/schemas/settings.entity';
import { SuperNotifications } from '../superNotifications/schemas/superNotifications.entity';
import { SuperNotificationsService } from '../superNotifications/superNotifications.service';
import { Fee } from './schemas/fee.entity';
import { Users } from '../auth/schemas/users.entity';
import { VisitsGoogleCalendarService } from './visitsGoogleCalendar.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Visits,
            Clients,
            Doctors,
            Insurance,
            PriceLists,
            Roles,
            Attachments,
            Treatments,
            Settings,
            SuperNotifications,
            Fee,
            Users,
        ]),
        AttachmentsModule,
    ],
    controllers: [VisitsController],
    providers: [VisitsService, VisitsGoogleCalendarService, AppGateway, PriceCalculationsService, VisitsUtilsService, SuperNotificationsService],
    exports: [VisitsService],
})
export class VisitsModule { }
