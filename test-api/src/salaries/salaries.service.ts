import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { Salaries } from './schemas/salaries.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { AppGateway } from '../app.gateway';

@Injectable()
export class SalariesService {
    constructor(
        private gateway: AppGateway,
        @InjectRepository(Salaries)
        private readonly salariesRepository: Repository<Salaries>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(DoctorSalaries)
        private readonly doctorSalariesRepository: Repository<DoctorSalaries>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
    ) { }

    async insertSalaries(body) {
        const alreadyHas = await this.salariesRepository.findOne({
            date: Between(moment(body.finishedMonth).startOf('month').format('YYYY-MM-DD hh:mm'), moment(body.finishedMonth).endOf('month').format('YYYY-MM-DD hh:mm')),
            doctors: body.id
        })
        if (alreadyHas) {
            if (body.confirmToAddSameMonth == true) {
                return await this.createNewSalary(body);
            } else {
                throw new ConflictException('Show modal to ask , insert or update salary')
            }
        } else {
            return await this.createNewSalary(body);
        }
    }

    async createNewSalary(body: any) {
        const newSalaries = this.salariesRepository.create({
            doctorSalaries: body.doctorSalaries,
            doctors: body,
            date: moment(body.finishedMonth).format('YYYY-MM-DD'),
            laboratories: body.laboratories,
            sum: body.sum
        });
        await this.doctorSalariesRepository.update(
            {
                id: In(body.doctorSalaries.map(el => el.id)),
            },
            { salarySent: true },
        );
        try {
            const result = await this.salariesRepository.save(newSalaries);
            if (body.id) {
                await this.updateFeeAndInsuranceTreatmentsStatus(body);
            }
            if (body.id) {
                await this.doctorsRepository.update(body.id, {
                    sum: 0,
                    laboratories: [],
                });
            }
            this.gateway.handleMessageCloseModalsWhenUpdate();
            return result;
        } catch (error) {
            console.log(error)
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async updateFeeAndInsuranceTreatmentsStatus(body: any) {
        const doctorBody = await this.doctorsRepository.findOne(body.id, {
            relations: ['visits'],
            loadRelationIds: true
        });
        const feeList = await this.feeRepository
            .createQueryBuilder('fee')
            .leftJoinAndSelect(
                'fee.visitsFees',
                'visitsFees'
            )
            .where('visitsFees.id IN (:...ids)', { ids: doctorBody.visits })
            .where('visitsFees.doctors = :id', { id: doctorBody.id })
            .andWhere('fee.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('fee.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: false })
            .getMany()

        if (feeList.length !== 0) {
            const feeListId = feeList.map(el => el.id)
            await this.feeRepository.update(
                {
                    id: In(feeListId),
                },
                { feeSentToSalary: true, feeSentForSalaryDate: moment(body.finishedMonth).format('YYYY-MM-DD') },
            );
        }
        const insuranceTreatments = await this.treatmentsRepository
            .createQueryBuilder('treatments')
            .leftJoin('treatments.visits', 'visits')
            .where('treatments.visits IN (:...valueIds)', { valueIds: doctorBody.visits })
            .andWhere('treatments.insuranceSalarySentToDoctor = :sentToDoctor', { sentToDoctor: true })
            .andWhere('treatments.insuranceSentForSalary = :sentForSalary', { sentForSalary: false })
            .getMany()
        if (insuranceTreatments.length != 0) {
            const insuranceIds = insuranceTreatments.map(el => el.id);
            await this.treatmentsRepository.update(
                {
                    id: In(insuranceIds),
                },
                { insuranceSentForSalary: true, insuranceSentForSalaryDate: moment(body.finishedMonth).format('YYYY-MM-DD') },
            );
        }
    }

    async getSalariess(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `salaries.${orderBy}`;
        const [list, count] = await this.salariesRepository
            .createQueryBuilder('salaries')
            .skip(skipNumber)
            .take(maxNumber)
            .leftJoinAndSelect('salaries.doctorSalaries', 'doctorSalaries')
            .leftJoinAndSelect('salaries.doctors', 'doctors')
            .leftJoinAndSelect('doctorSalaries.insurance', 'insurance')
            .leftJoinAndSelect('doctorSalaries.clientsTemplates', 'clientsTemplatess')
            .leftJoinAndSelect('doctors.clientsTemplates', 'clientsTemplates')
            // .leftJoinAndSelect(
            //     'salaries.doctorSalaries',
            //     'doctorSalaries'
            // )
            // .leftJoinAndSelect(
            //     'salaries.doctors',
            //     'doctors'
            // )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('name')) {
                    qb.where(`doctors.name ILIKE :name`, { name: `%${parsedFilter.name.trim()}%` })
                }
                if (parsedFilter.hasOwnProperty('doctor')) {
                    qb.andWhere(`doctors.id = :id`, { id: parsedFilter.doctor })
                }
                if (parsedFilter.hasOwnProperty('date')) {
                    qb.andWhere(`salaries.date >= :date`, { date: moment(parsedFilter.date).startOf('month').format('YYYY-MM-DD hh:mm') })
                    qb.andWhere(`salaries.date <= :dateEnd`, { dateEnd: moment(parsedFilter.date).endOf('month').format('YYYY-MM-DD hh:mm') })
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .groupBy('salaries.id, doctors.id, doctorSalaries.id, clientsTemplates.id, clientsTemplatess.id, insurance.id')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManySalaries(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.salariesRepository.find({
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async getSalaries(salariesId: string) {
        const salaries = await this.findSalaries(salariesId);
        return salaries
    }


    async updateSalaries(id, body): Promise<any> {
        const newData = body;
        return await this.salariesRepository.save(newData);
    }

    async deleteSalaries(salariesId: string) {
        try {
            return await this.salariesRepository.delete(salariesId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteSalariess(salariesIds): Promise<any> {
        const { ids } = salariesIds;
        try {
            return await this.salariesRepository.delete(ids);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findSalaries(id: string): Promise<Salaries> {
        let salaries;
        try {
            salaries = await this.salariesRepository
                .createQueryBuilder('salaries')
                .leftJoinAndSelect('salaries.doctorSalaries', 'doctorSalaries')
                .leftJoinAndSelect('salaries.doctors', 'doctors')
                .leftJoinAndSelect('doctorSalaries.insurance', 'insurance')
                .leftJoinAndSelect('doctorSalaries.clientsTemplates', 'clientsTemplatess')
                .leftJoinAndSelect('doctors.clientsTemplates', 'clientsTemplates')
                .where('salaries.id = :id', { id: id })
                .andWhere('doctorSalaries.salarySent = :salarySent', { salarySent: true })
                .getOne()

            let { sum } = await this.doctorSalariesRepository
                .createQueryBuilder('doctorSalaries')
                .leftJoinAndSelect('doctorSalaries.doctors', 'doctors')
                .leftJoinAndSelect('doctorSalaries.salaries', 'salaries')
                .select("SUM(doctorSalaries.price)", "sum")
                .where('salaries.doctors.id = :id', { id: salaries.doctors.id })
                .getRawOne();

            salaries.total = sum;
            return salaries;
        } catch (error) {
            throw new NotFoundException('Could not find salaries.');
        }
    }
}
