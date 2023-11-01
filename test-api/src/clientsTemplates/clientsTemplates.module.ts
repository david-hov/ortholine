import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ClientsTemplatesController } from './clientsTemplates.controller';
import { ClientsTemplatesService } from './clientsTemplates.service';

import { ClientsTemplates } from './schemas/clientsTemplates.entity';
import { Clients } from '../clients/schemas/clients.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { AppGateway } from '../app.gateway';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            ClientsTemplates,
            Clients,
            Doctors,
            DoctorSalaries,
            Visits,
        ]),
    ],
    controllers: [ClientsTemplatesController],
    providers: [ClientsTemplatesService, AppGateway],
    exports: [ClientsTemplatesService],
})
export class ClientsTemplatesModule { }
