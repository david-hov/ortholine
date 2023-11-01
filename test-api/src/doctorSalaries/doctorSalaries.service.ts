import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { DoctorSalaries } from './schemas/doctorSalaries.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';


import { Insurance } from '../insurance/schemas/insurance.entity';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';

@Injectable()
export class DoctorSalariesService {
    constructor(
        @InjectRepository(DoctorSalaries)
        private readonly doctorSalariesRepository: Repository<DoctorSalaries>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Insurance)
        private readonly insuranceRepository: Repository<Insurance>,
        @InjectRepository(ClientsTemplates)
        private readonly clientsTemplatesRepository: Repository<ClientsTemplates>
    ) {}

    async insertDoctorSalaries(body) {
        if (body.doctors) {
            body.doctors = await this.doctorsRepository.findOne(body.doctors);
        }
        if (body.insurance) {
            body.insurance = await this.insuranceRepository.findOne(body.insurance);
        }
        if (body.clientsTemplates) {
            body.clientsTemplates = await this.clientsTemplatesRepository.findOne(body.clientsTemplates);
        }
        const newDoctorSalaries = this.doctorSalariesRepository.create({
            price: body.price,
            special: body.special,
            specialPercentage: body.specialPercentage,
            insurance: body.insurance,
            doctors: body.doctors,
            clientsTemplates: body.clientsTemplates
        });
        try {
            return await this.doctorSalariesRepository.save(newDoctorSalaries);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getDoctorSalariess(limit: string, page: string, orderBy: string, orderDir: string) {
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = orderBy !== 'doctors'
            ? `doctorSalaries.${orderBy}` : `${orderBy}.id`;
        const [list, count] = await this.doctorSalariesRepository
            .createQueryBuilder('doctorSalaries')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'doctorSalaries.doctors',
                'doctors'
            )
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyDoctorSalaries(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.doctorSalariesRepository.find({
            where: { id: In(filterData.ids) },
            relations: ['insurance']
        });
        return {
            data
        };
    }

    async getDoctorSalaries(doctorSalariesId: string) {
        const doctorSalaries = await this.findDoctorSalaries(doctorSalariesId);
        return doctorSalaries
    }

    async updateDoctorSalaries(id, body): Promise<any> {
        const newData = body;
        if (newData.doctors) {
            newData.doctors = await this.doctorsRepository.findByIds(newData.doctors);
        }
        return await this.doctorSalariesRepository.save(newData);
    }

    async deleteDoctorSalaries(doctorSalariesId: string) {
        try {
            return await this.doctorSalariesRepository.delete(doctorSalariesId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteDoctorSalariess(doctorSalariesIds): Promise<any> {
        const { ids } = doctorSalariesIds;
        try {
            const result = await this.doctorSalariesRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findDoctorSalaries(id: string): Promise<DoctorSalaries> {
        let doctorSalaries;
        try {
            doctorSalaries = await this.doctorSalariesRepository.findOne(
                id, {
                relations: ['doctors', 'insurance'],
                // loadRelationIds: true,
            });
            return doctorSalaries;
        } catch (error) {
            throw new NotFoundException('Could not find doctorSalaries.');
        }
    }
}
