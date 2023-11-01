import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { Clients, ClientsStatus } from '../clients/schemas/clients.entity';
import { Visits, VisitStatus } from '../visits/schemas/visits.entity';
import { Roles } from '../auth/schemas/roles.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
    ) { }

    async getNotFinishedClientss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `clients.${orderBy}`;

        const clients = await this.clientsRepository.createQueryBuilder('clients')
            .leftJoinAndSelect(
                'clients.visits',
                'visits'
            )
            .where('clients.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('clients.isFinished = :isFinished', { isFinished: ClientsStatus['NOTFINISHED'] })
            .orWhere('clients.isFinished = :isFinishedCall', { isFinishedCall: ClientsStatus['NEEDTOCALL'] })
            .orderBy('visits.startDate', 'DESC')
            .getMany();

        if (clients) {
            const notFinished = [];
            const needToCall = [];
            for (let i = 0; i < clients.length; i++) {
                if (clients[i].visits.length !== 0 && moment().isAfter(moment(clients[i].visits[0].endDate))) {
                    needToCall.push(clients[i].id)
                } else {
                    notFinished.push(clients[i].id)
                }
            }
            const clientsFinsihed = this.clientsRepository.update({ id: In(notFinished) },
                { isFinished: ClientsStatus['NOTFINISHED'] },
            );
            const clientsNeedToCall = this.clientsRepository.update({ id: In(needToCall) },
                { isFinished: ClientsStatus['NEEDTOCALL'] },
            );
            await Promise.all([clientsFinsihed, clientsNeedToCall]);
        }

        const [list, count] = await this.clientsRepository
            .createQueryBuilder('clients')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'clients.visits',
                'visits',
            )
            .where(qb => {
                qb.where('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('isFinished')) {
                    qb.andWhere(`clients.isFinished = :isFinished`, { isFinished: ClientsStatus['NEEDTOCALL'] })
                }
                if (parsedFilter.hasOwnProperty('isWaiting')) {
                    qb.orWhere(`clients.isWaiting = :waiting`, { waiting: parsedFilter['isWaiting'] })
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getCallClientsLabs() {
        const callClients = this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere('visits.callClient = :callClient', { callClient: true });
            })
            .getMany();

        const callLabs = this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere('visits.callLab = :callLab', { callLab: true });
            })
            .getMany()

        const data = await Promise.all([callClients, callLabs])

        return {
            data: data,
            count: 0
        };
    }

    async getPriceIssues() {
        const [list, count] = await this.visitsRepository
            .createQueryBuilder('visits')
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere('visits.notifyAdminAboutPrice = :notifyAdminAboutPrice', { notifyAdminAboutPrice: true });
            })
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getAllClientsnotFinishedVisits(limit: string, page: string, userId: string) {
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);

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
            .loadAllRelationIds()
            .leftJoin(
                'visits.doctors',
                'doctors',
            )
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere(`visits.treatmentsFilled = :treatmentsFilled`, { treatmentsFilled: false })
                qb.andWhere(`visits.lastVisitChecked = :lastVisitChecked`, { lastVisitChecked: VisitStatus['CAME'] })
                if (roleData && roleData.name === 'doctor') {
                    qb.andWhere('doctors.id = :userId', { userId: roleData.user[0].doctors.id })
                }
            })
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getAllClientsReminders(limit: string, page: string, orderBy: string, orderDir: string) {
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `clients.${orderBy}`;
        const [list, count] = await this.clientsRepository
            .createQueryBuilder('clients')
            .skip(skipNumber)
            .take(maxNumber)
            .where(qb => {
                qb.where('clients.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere("clients.extraInfo != :extraInfo", { extraInfo: '[]' });
                qb.andWhere(`clients.extraInfo ::jsonb @@ '$.date like_regex "${moment().add(1, 'days').format('YYYY-MM-DD')}"'`)
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }
}
