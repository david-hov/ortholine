import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DoctorsController } from './doctors.controller';
import { DoctorsService } from './doctors.service';
import { Doctors } from './schemas/doctors.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Laboratories } from '../laboratories/schemas/laboratories.entity';
import { Salaries } from '../salaries/schemas/salaries.entity';
import { Users } from '../auth/schemas/users.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Doctors,
            Visits,
            Laboratories,
            Salaries,
            Users,
            Treatments,
            Insurance,
            Fee,
            DoctorSalaries,
            ClientsTemplates,
        ]),
    ],
    controllers: [DoctorsController],
    providers: [DoctorsService],
    exports: [DoctorsService],
})
export class DoctorsModule { }
