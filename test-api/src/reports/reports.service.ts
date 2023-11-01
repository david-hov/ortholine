import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { Doctors } from '../doctors/schemas/doctors.entity';
import { Treatments } from '../visits/schemas/treatments.entity';


import { Visits } from '../visits/schemas/visits.entity';
import { Laboratories } from '../laboratories/schemas/laboratories.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { Salaries } from '../salaries/schemas/salaries.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Laboratories)
        private readonly laboratoriesRepository: Repository<Laboratories>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(Salaries)
        private readonly salariesRepository: Repository<Salaries>,
    ) { }

    async getCurrentReportsForDoctor(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const data = this.visitsRepository.createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients',
            )
            .leftJoinAndSelect(
                'visits.clientsTemplates',
                'clientsTemplates'
            )
            .leftJoinAndSelect(
                'visits.insurance',
                'insurance'
            )
            .leftJoinAndSelect(
                'visits.feeHistory',
                'feeHistory'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            // .andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: false })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .orderBy('feeHistory.id', 'ASC')
            .getMany()

        const visitsPriceQuery = this.visitsRepository.createQueryBuilder('visits')
            .select('SUM(visits.price)', 'totalVisitsPrice')
            .leftJoin(
                'visits.doctors',
                'doctors'
            )
            .leftJoin(
                'visits.feeHistory',
                'feeHistory'
            )
            .leftJoin(
                'visits.clients',
                'clients'
            )
            .leftJoin(
                'visits.clientsTemplates',
                'clientsTemplates'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            // .andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: false })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .groupBy('doctors.id')
            .getRawOne();

        const feeValueQuery = this.visitsRepository.createQueryBuilder('visits')
            .select('SUM(feeHistory.feeValue)', 'totalFeeValue')
            .leftJoin('visits.feeHistory', 'feeHistory')
            .leftJoin('visits.doctors', 'doctors')
            .leftJoin(
                'visits.clients',
                'clients'
            )
            .leftJoin(
                'visits.clientsTemplates',
                'clientsTemplates'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            // .andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('feeHistory.fromClinic = :fromClinic', { fromClinic: false })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: false })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .groupBy('doctors.id')
            .getRawOne();

        const [listData, visitsPriceResult, feeValueResult] = await Promise.all([data, visitsPriceQuery, feeValueQuery]);
        const totalVisitPriceValue = visitsPriceResult ? visitsPriceResult.totalVisitsPrice : 0;
        const totalFeeValue = feeValueResult ? feeValueResult.totalFeeValue : 0;
        return {
            data: [{ listData, totalVisitPriceValue, totalFeeValue, special: parsedFilter.special, specialPercentage: parsedFilter.specialPercentage }],
            count: listData.length
        };
    }

    async getCurrentReportsInsuranceForDoctor(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const data = this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'visits.insurance',
                'insurance'
            )
            .leftJoinAndSelect(
                'visits.treatments',
                'treatments'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            .andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: true })
            .andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: false })
            .orderBy('treatments.id', 'ASC')
            .getMany()

        const treatmentValueQuery = this.treatmentsRepository.createQueryBuilder('treatments')
            .select('SUM(treatments.insurancePriceForTreatment - (treatments.insurancePriceForTreatment * insuranceForTreatment.percentage) / 100)', 'realTotalInsuranceValue')
            .addSelect('SUM(treatments.insurancePriceForTreatment - (treatments.insurancePriceForTreatment * insuranceForTreatment.percentage) / 100) * doctorsTreatment.percentage / 100', 'totalInsuranceValue')
            .leftJoin('treatments.insuranceForTreatment', 'insuranceForTreatment')
            .leftJoin('treatments.doctorsTreatment', 'doctorsTreatment')
            .where('doctorsTreatment.id = :doctorId', { doctorId: parsedFilter.doctors })
            .andWhere('insuranceForTreatment.id = :insuranceId', { insuranceId: parsedFilter.insurance })
            .andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: true })
            .andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: false })
            .groupBy('doctorsTreatment.id')
            .getRawOne();

        const [listData, treatmentValueResult] = await Promise.all([data, treatmentValueQuery]);
        const totalInsuranceValue = treatmentValueResult ? treatmentValueResult.totalInsuranceValue : 0;
        const realTotalInsuranceValue = treatmentValueResult ? treatmentValueResult.realTotalInsuranceValue : 0;

        return {
            data: [{ listData, totalInsuranceValue, realTotalInsuranceValue }],
            count: listData.length
        };
    }

    async getCurrentReportsForSalary(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const data = this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'visits.insurance',
                'insurance'
            )
            .leftJoinAndSelect(
                'visits.feeHistory',
                'feeHistory'
            )
            .leftJoin(
                'visits.clientsTemplates',
                'clientsTemplates'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: true })
            .andWhere('feeHistory.feeSentForSalaryDate = :feeSentForSalaryDate', { feeSentForSalaryDate: moment(parsedFilter.date).format('YYYY-MM-DD hh:mm:ss') })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .orderBy('feeHistory.id', 'ASC')
            .getMany()

        const visitsPriceQuery = this.visitsRepository.createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.feeHistory',
                'feeHistory'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoin(
                'clients.clientsTemplates',
                'clientsTemplates'
            )
            .select('SUM(visits.price)', 'totalVisitsPrice')
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: true })
            .andWhere('feeHistory.feeSentForSalaryDate = :feeSentForSalaryDate', { feeSentForSalaryDate: moment(parsedFilter.date).format('YYYY-MM-DD hh:mm:ss') })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .groupBy('doctors.id')
            .getRawOne();

        const feeValueQuery = this.visitsRepository.createQueryBuilder('visits')
            .select('SUM(feeHistory.feeValue)', 'totalFeeValue')
            .addSelect('SUM(feeHistory.currentBalance)', 'totalBalance')
            .leftJoin('visits.feeHistory', 'feeHistory')
            .leftJoin('visits.doctors', 'doctors')
            .leftJoin('visits.clients', 'clients')
            .leftJoin('clients.clientsTemplates', 'clientsTemplates')
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            .andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: true })
            .andWhere('feeHistory.fromClinic = :fromClinic', { fromClinic: false })
            .andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: true })
            .andWhere('feeHistory.feeSentForSalaryDate = :feeSentForSalaryDate', { feeSentForSalaryDate: moment(parsedFilter.date).format('YYYY-MM-DD hh:mm:ss') })
            .andWhere(new Brackets(qb => {
                if (parsedFilter.special) {
                    qb.andWhere('clientsTemplates.doctors = :doctors', { doctors: parsedFilter.doctors })
                        .andWhere('clientsTemplates.id = :templateId', { templateId: parsedFilter.specialClientsTemplates })
                        .andWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: true })
                } else {
                    qb.andWhere('clientsTemplates.doctors != :doctors', { doctors: parsedFilter.doctors })
                        .orWhere('visits.clientsTemplates IS NULL')
                        .orWhere('clientsTemplates.doctors IS NULL')
                        .orWhere('visits.clientsTemplatesConfirmed = :clientsTemplatesConfirmed', { clientsTemplatesConfirmed: false })
                }
            }))
            .groupBy('doctors.id')
            .getRawOne();

        const [listData, visitsPriceResult, feeValueResult] = await Promise.all([data, visitsPriceQuery, feeValueQuery]);
        const totalVisitPriceValue = visitsPriceResult ? visitsPriceResult.totalVisitsPrice : 0;
        const totalFeeValue = feeValueResult ? feeValueResult.totalFeeValue : 0;

        return {
            data: [{ listData, totalVisitPriceValue, totalFeeValue, special: parsedFilter.special, specialPercentage: parsedFilter.specialPercentage }],
            count: listData.length
        };
    }

    async getCurrentReportsInsuranceForSalary(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const data = this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'visits.insurance',
                'insurance'
            )
            .leftJoinAndSelect(
                'visits.treatments',
                'treatments'
            )
            .where('visits.doctors = :id', { id: parsedFilter.doctors })
            .andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: true })
            .andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: true })
            .andWhere('treatments.insuranceSentForSalaryDate = :insuranceSentForSalaryDate', { insuranceSentForSalaryDate: moment(parsedFilter.date).format('YYYY-MM-DD hh:mm:ss') })
            .orderBy('treatments.id', 'ASC')
            .getMany()

        const treatmentValueQuery = this.treatmentsRepository.createQueryBuilder('treatments')
            .select('SUM(treatments.insurancePriceForTreatment - (treatments.insurancePriceForTreatment * insuranceForTreatment.percentage) / 100)', 'realTotalInsuranceValue')
            .addSelect('SUM(treatments.insurancePriceForTreatment - (treatments.insurancePriceForTreatment * insuranceForTreatment.percentage) / 100) * doctorsTreatment.percentage / 100', 'totalInsuranceValue')
            .leftJoin('treatments.insuranceForTreatment', 'insuranceForTreatment')
            .leftJoin('treatments.doctorsTreatment', 'doctorsTreatment')
            .where('doctorsTreatment.id = :doctorId', { doctorId: parsedFilter.doctors })
            .andWhere('insuranceForTreatment.id = :insuranceId', { insuranceId: parsedFilter.insurance })
            .andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: true })
            .andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: true })
            .andWhere('treatments.insuranceSentForSalaryDate = :insuranceSentForSalaryDate', { insuranceSentForSalaryDate: moment(parsedFilter.date).format('YYYY-MM-DD hh:mm:ss') })
            .groupBy('doctorsTreatment.id')
            .getRawOne();

        const [listData, treatmentValueResult] = await Promise.all([data, treatmentValueQuery]);
        const totalInsuranceValue = treatmentValueResult ? treatmentValueResult.totalInsuranceValue : 0;
        const realTotalInsuranceValue = treatmentValueResult ? treatmentValueResult.realTotalInsuranceValue : 0;

        return {
            data: [{ listData, totalInsuranceValue, realTotalInsuranceValue }],
            count: listData.length
        };
    }

    async getLabReports(doctorId: any) {
        const doctor: any = await this.doctorsRepository
            .createQueryBuilder('doctors')
            .where(qb => {
                qb.where('doctors.id = :id', { id: doctorId });
            })
            .getOne();
        if (doctor.laboratories.length !== 0) {
            for (let i = 0; i < doctor.laboratories.length; i++) {
                doctor.laboratories[i].laboratories = await (await this.laboratoriesRepository.findOne(doctor.laboratories[i].laboratories)).name;
            }
        }
        return doctor
    }

    async getLabReportsForSalary(salaryId: any) {
        const salary: any = await this.salariesRepository
            .createQueryBuilder('salaries')
            .where(qb => {
                qb.where('salaries.id = :id', { id: salaryId });
            })
            .getOne();
        if (salary.laboratories.length !== 0) {
            for (let i = 0; i < salary.laboratories.length; i++) {
                salary.laboratories[i].laboratories = await (await this.laboratoriesRepository.findOne(salary.laboratories[i].laboratories)).name;
            }
        }
        return salary.laboratories
    }
}
