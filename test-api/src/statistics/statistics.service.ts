import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Doctors } from '../doctors/schemas/doctors.entity';
import * as moment from 'moment';
import { Visits, VisitStatus } from '../visits/schemas/visits.entity';
import { Clients } from '../clients/schemas/clients.entity';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
    ) {}

    async getClientsMainStatistics(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const [list, count] = await this.clientsRepository
            .createQueryBuilder('clients')
            .where(qb => {
                if (parsedFilter.hasOwnProperty('period')) {
                    qb.where('clients.isDeleted = :isDeleted', { isDeleted: false })
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(new Date()).year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(new Date()).year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .orderBy('clients.createdAt', 'ASC')
            .getManyAndCount();

        const dataList = [];
        list.forEach((item: any) => {
            const alreadyHas = dataList.findIndex((el: any) => el.month === moment(item.createdAt).format('MMM'))
            if (alreadyHas > -1) {
                dataList[alreadyHas].total = dataList[alreadyHas].total + 1
            } else {
                dataList.push({
                    monthNumber: moment(item.createdAt).format('MM'),
                    month: moment(item.createdAt).format('MMM'),
                    total: 1
                });
            }
        });
        return {
            data: dataList,
            count: count
        };
    }

    async getVisitsMainStatistics(filter: string) {
        const parsedFilter = JSON.parse(filter);

        const [list, count] = await this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                if (parsedFilter.hasOwnProperty('period')) {
                    qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .orderBy('visits.startDate', 'ASC')
            .getManyAndCount();

        const dataList = [];
        list.forEach((item: any) => {
            const alreadyHas = dataList.findIndex((el: any) => el.month === moment(item.startDate).format('MMM'))
            if (alreadyHas > -1) {
                dataList[alreadyHas].total = dataList[alreadyHas].total + 1
            } else {
                dataList.push({
                    monthNumber: moment(item.startDate).format('MM'),
                    month: moment(item.startDate).format('MMM'),
                    total: 1
                });
            }
        });
        return {
            data: dataList,
            count: count
        };
    }

    async getVisitsStatistics(filter: string) {
        const parsedFilter = JSON.parse(filter);
        let [d, clinic] = await this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.insurance ISNULL')
                qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();

        let [list, insurance] = await this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.insurance IS NOT NULL')
                qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();
        const doctorsList = await this.doctorsRepository.find();

        let [visitsDoctorsList, visitsDoctorsCount] = await this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .where(qb => {
                qb.where(`visits.lastVisitChecked = :lastVisitChecked`, { lastVisitChecked: VisitStatus['CAME'] })
                qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :dateYear`, { dateYear: moment().year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateYearEnd`, { dateYearEnd: moment().year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();


        const doctorsVisitsCount = doctorsList.map((item: any) => {
            if (item.total == null) {
                item.total = 0;
            }
            visitsDoctorsList.forEach((el) => {
                if (item.name === el.doctors.name) {
                    item.total = item.total + 1
                }
            })
            return {
                name: item.shortName,
                value: item.total,
                color: item.color
            }
        })

        const visitsPrice = await this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .orderBy('visits.startDate', 'ASC')
            .getMany();

        const visitsPriceList = [];
        visitsPrice.forEach((item: any) => {
            const alreadyHas = visitsPriceList.findIndex((el: any) => el.month === moment(item.startDate).format('MMM'))
            if (alreadyHas > -1) {
                visitsPriceList[alreadyHas].total = visitsPriceList[alreadyHas].total + item.fee
            } else {
                visitsPriceList.push({
                    monthNumber: moment(item.startDate).format('MM'),
                    month: moment(item.startDate).format('MMM'),
                    total: item.fee
                });
            }
        });

        const cashNotCash = await this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect('visits.feeHistory', 'feeHistory')
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).year(parsedFilter.period).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).year(parsedFilter.period).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .select('feeHistory.isCash', 'isCash')
            .addSelect('COUNT(feeHistory.isCash)', 'count')
            .addSelect('SUM(feeHistory.feeValue)', 'value')
            .groupBy('feeHistory.isCash')
            .getRawMany();

        const isCash = cashNotCash.map(row => ({
            isCash: row.isCash,
            count: parseInt(row.count),
            value: parseInt(row.value),
        }));

        const dataList = [{
            doctorsVisits: doctorsVisitsCount,
            insuranceOrNot: [
                { name: 'ԱՊՊԱ', value: insurance },
                { name: 'Կլինիկա', value: clinic },
            ],
            prices: visitsPriceList,
            cashNotCash: isCash
        }];

        return {
            data: dataList,
            count: 0
        };
    }

    async getClientsStatistics(filter: string) {
        const parsedFilter = JSON.parse(filter);
        let [d, notBalance] = await this.visitsRepository
            .createQueryBuilder('visits')
            .loadAllRelationIds()
            .where(qb => {
                qb.where('visits.balance <= :balance', { balance: 0 })
                qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();
        let [list, balance] = await this.visitsRepository
            .createQueryBuilder('visits')
            .loadAllRelationIds()
            .where(qb => {
                qb.where('visits.balance > :balance', { balance: 0 })
                qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`visits.startDate >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();

        let [orthodontiaList, countOrthodontia] = await this.clientsRepository
            .createQueryBuilder('clients')
            .where(qb => {
                qb.where('clients.orthodontia = :orthodontia', { orthodontia: true })
                qb.andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();

        let [orthopediaList, countOrthopedia] = await this.clientsRepository
            .createQueryBuilder('clients')
            .where(qb => {
                qb.where('clients.orthopedia = :orthopedia', { orthopedia: true })
                qb.andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();

        let [implantList, countImplant] = await this.clientsRepository
            .createQueryBuilder('clients')
            .where(qb => {
                qb.where('clients.implant = :implant', { implant: true })
                qb.andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('period')) {
                    if (isNaN(parsedFilter.period)) {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(parsedFilter.period).startOf('month').format('YYYY-MM-DD 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(parsedFilter.period).endOf('month').format('YYYY-MM-DD 23:59:00') })
                    } else {
                        qb.andWhere(`clients.createdAt >= :date`, { date: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-01-01 00:00:00') })
                        qb.andWhere(`clients.createdAt <= :dateEnd`, { dateEnd: moment(new Date()).set({ 'year': parsedFilter.year }).format('YYYY-12-31 23:59:00') })
                    }
                }
            })
            .getManyAndCount();

        const dataList = [{
            balance: [
                { name: 'Մնացորդ', value: balance },
                { name: 'Անմնացորդ', value: notBalance },
            ],
            clientCategory: [
                { name: 'Իմպլանտ', value: countImplant },
                { name: 'Օրթոպեդիա', value: countOrthopedia },
                { name: 'Օրթոդոնտիա', value: countOrthodontia },
            ],
        }];

        return {
            data: dataList,
            count: 0
        };
    }
}
