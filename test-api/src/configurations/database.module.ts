import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigurationModule } from './config.module';
import { ConfigService } from './config.service';
import { Clients } from '../clients/schemas/clients.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { Rooms } from '../rooms/schemas/rooms.entity';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';
import { PriceLists } from '../priceLists/schemas/priceLists.entity';
import { Laboratories } from '../laboratories/schemas/laboratories.entity';
import { Salaries } from '../salaries/schemas/salaries.entity';
import { Users } from '../auth/schemas/users.entity';
import { Roles } from '../auth/schemas/roles.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { Settings } from '../settings/schemas/settings.entity';
import { SuperNotifications } from '../superNotifications/schemas/superNotifications.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { Reports } from '../reports/schemas/reports.entity';
import { Deposits } from '../deposits/schemas/deposits.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigurationModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return ({
                    type: config.databaseType,
                    host: config.databaseHost,
                    port: config.databasePort,
                    database: config.databaseName,
                    username: config.databaseUserName,
                    password: config.databasePassword,
                    entities: [
                        Users,
                        Roles,
                        Clients,
                        Visits,
                        Attachments,
                        Doctors,
                        Insurance,
                        Rooms,
                        ClientsTemplates,
                        PriceLists,
                        Laboratories,
                        Salaries,
                        Treatments,
                        Settings,
                        SuperNotifications,
                        Fee,
                        Reports,
                        Deposits,
                        DoctorSalaries,
                    ],
                    synchronize: true,
                    autoSchemaSync: true,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                } as TypeOrmModuleOptions);
            },
        }),
    ],
})
export class DatabaseModule { }
