import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';

import { Visits, VisitStatus } from './schemas/visits.entity';
import { AppGateway } from '../app.gateway';
import { Roles } from '../auth/schemas/roles.entity';
import { Clients, ClientsStatus } from '../clients/schemas/clients.entity';
import { Users } from '../auth/schemas/users.entity';
import { VisitsGoogleCalendarService } from './visitsGoogleCalendar.service';



@Injectable()
export class VisitsUtilsService {
    constructor(
        private gateway: AppGateway,
        private readonly visitsGoogleCalendarService: VisitsGoogleCalendarService,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
    ) {}

    async getCalendarVisitss(filter: string, limit: string, page: string, userId: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `visits.startDate`;

        const roleData = await this.rolesRepository
            .createQueryBuilder('roles')
            .leftJoinAndSelect(
                'roles.user',
                'user'
            )
            .leftJoinAndSelect(
                'user.doctors',
                'doctors'
            )
            .where('user.id = :id', { id: userId })
            .getOne()

        const [list, count] = await this.visitsRepository
            .createQueryBuilder('visits')
            .skip(skipNumber)
            .take(maxNumber)
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'clients.clientsTemplates',
                'clientsTemplates'
            )
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .leftJoinAndSelect(
                'visits.insurance',
                'insurance'
            )
            .leftJoinAndSelect(
                'doctors.rooms',
                'rooms'
            )
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (roleData && roleData.name === 'doctor') {
                    qb.andWhere('doctors.id = :doctorId', { doctorId: roleData.user[0].doctors.id })
                } else {
                    if (parsedFilter.hasOwnProperty('doctor') && parsedFilter.doctor !== '') {
                        qb.andWhere(`doctors.id = :doctorId`, { doctorId: parsedFilter.doctor })
                    }
                }
                if (parsedFilter.hasOwnProperty('startDate') && parsedFilter.startDate !== '') {
                    qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD HH:mm:ss") })
                    qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.endDate).format("YYYY-MM-DD 23:59:ss") })
                }
                if (parsedFilter.hasOwnProperty('client') && parsedFilter.client !== '') {
                    qb.andWhere(`clients.id = :clientId`, { clientId: parsedFilter.client })
                }
            })
            .orderBy(sortData, 'DESC')
            .getManyAndCount();

        const result = list.map((item: any) => {
            return {
                id: item.id,
                late: (moment().format() > moment(item.startDate).format() && item.lastVisitChecked == VisitStatus['LATE']) ? true : false,
                title: item.clients !== null ? item.clients.name : 'Չկա',
                info: item.info !== null ? item.info : 'Չկա',
                insurance: item.insurance !== null ? item.insurance.name : 'Չկա',
                template: item.clients !== null ? item.clients.clientsTemplates !== null ? item.clients.clientsTemplates.name : 'Չկա' : 'Չկա',
                color: item.doctors !== null ? item.doctors.color : null,
                doctor: item.doctors !== null ? item.doctors.name : 'Չկա',
                room: item.doctors !== null && item.doctors.rooms !== null ? item.doctors.rooms.name : 'Չկա',
                start: moment(item.startDate).toDate(),
                end: moment(item.endDate).toDate(),
            }
        })
        this.gateway.handleMessage();
        return {
            data: result,
            count: count
        };
    }

    async printVisitsStatistics(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const [list, count] = await this.visitsRepository
            .createQueryBuilder('visits')
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'visits.doctors',
                'doctors'
            )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('startDate') && parsedFilter.hasOwnProperty('endDate')) {
                    qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD HH:mm:ss") })
                    qb.andWhere(`visits.endDate <= :dateEnd`, { dateEnd: moment(parsedFilter.endDate).format("YYYY-MM-DD 23:59:ss") })
                }
            })
            .orderBy('visits.startDate', 'ASC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getTotal(filter: string) {
        const parsedFilter = JSON.parse(filter);
        let { sum } = await this.visitsRepository
            .createQueryBuilder('visits')
            .select("SUM(visits.balance)", "sum")
            .where(qb => {
                qb.where('visits.balance > :number', { number: 0 })
                if (parsedFilter.hasOwnProperty('startDate') && parsedFilter.startDate != null) {
                    qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD HH:mm:ss") })
                    qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.endDate).format("YYYY-MM-DD 23:59:ss") })
                }
            })
            .getRawOne();
        return {
            data: sum !== null ? [sum] : []
        }
    }

    async getXrayCount(filter: string) {
        const parsedFilter = JSON.parse(filter);
        let { sum } = await this.visitsRepository
            .createQueryBuilder('visits')
            .select("SUM(visits.xRayCount)", "sum")
            .where(qb => {
                if (parsedFilter.hasOwnProperty('startDate') && parsedFilter.startDate != null) {
                    qb.where(`visits.startDate >= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD HH:mm:ss") })
                    qb.andWhere(`visits.startDate <= :dateEnd`, { dateEnd: moment(parsedFilter.endDate).format("YYYY-MM-DD 23:59:ss") })
                }
            })
            .getRawOne();
        return {
            data: sum !== null ? [sum] : []
        }
    }

    async updateClientStatus(id) {
        const visit = await this.visitsRepository.findOne(id, {
            relations: ['clients'],
            loadRelationIds: true
        });

        const client = await this.clientsRepository.createQueryBuilder('clients')
            .leftJoinAndSelect(
                'clients.visits',
                'visits'
            )
            .where('clients.id = :clientId', { clientId: visit.clients })
            .andWhere('clients.isFinished = :isFinished', { isFinished: ClientsStatus['NOTFINISHED'] })
            .orWhere('clients.isFinished = :isFinishedCall', { isFinishedCall: ClientsStatus['NEEDTOCALL'] })
            .orderBy('visits.startDate', 'DESC')
            .getOne();
        if (client) {
            let status;
            if (client.visits.length !== 0 && moment().isAfter(moment(client.visits[0].startDate))) {
                status = ClientsStatus['NEEDTOCALL']
            } else {
                status = ClientsStatus['NOTFINISHED']
            }
            await this.clientsRepository.update(client.id, {
                isFinished: status
            });
        }
    }

    async updateMovementVisists(id, body) {
        const result = await this.visitsRepository.update(id, {
            startDate: moment(body.start).format("YYYY-MM-DD HH:mm:ss"),
            endDate: moment(body.end).format("YYYY-MM-DD HH:mm:ss")
        })
        const visit = await this.visitsRepository.findOne(id, {
            relations: ['doctors', 'clients', 'clients.clientsTemplates', 'insurance']
        })
        // Google Calendar
        if (visit.googleCalendarEventId) {
            const data = await this.usersRepository.findOne({
                where: {
                    doctors: visit.doctors
                },
                relations: ['doctors']
            })
            if (data && data.googleToken) {
                await this.visitsGoogleCalendarService.updateEvent(visit, data.googleToken)
            }
        }
        await this.updateClientStatus(id);
        this.gateway.handleMessage();
        return result;
    }

    async updateIsArrivedVisits(id, body) {
        return await this.visitsRepository.update(id, body);
    }
}
