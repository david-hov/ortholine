import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import 'reflect-metadata';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './configurations/database.module';
import { ClientsModule } from './clients/clients.module';
import { VisitsModule } from './visits/visits.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { DoctorsModule } from './doctors/doctors.module';
import { InsuranceModule } from './insurance/insurance.module';
import { RoomsModule } from './rooms/rooms.module';
import { ClientsTemplatesModule } from './clientsTemplates/clientsTemplates.module';
import { PriceListsModule } from './priceLists/priceLists.module';
import { LaboratoriesModule } from './laboratories/laboratories.module';
import { SalariesModule } from './salaries/salaries.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { StatisticsModule } from './statistics/statistics.module';
import { SettingsModule } from './settings/settings.module';
import { SuperNotificationsModule } from './superNotifications/superNotifications.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { DepositsModule } from './deposits/deposits.module';
import { DoctorSalariesModule } from './doctorSalaries/doctorSalaries.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
        AuthModule,
        RolesModule,
        ClientsModule,
        VisitsModule,
        DoctorsModule,
        AttachmentsModule,
        InsuranceModule,
        RoomsModule,
        ClientsTemplatesModule,
        PriceListsModule,
        LaboratoriesModule,
        SalariesModule,
        StatisticsModule,
        SettingsModule,
        NotificationsModule,
        SuperNotificationsModule,
        ReportsModule,
        DepositsModule,
        DoctorSalariesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
