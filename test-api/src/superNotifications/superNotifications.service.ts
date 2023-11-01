import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SuperNotifications } from './schemas/superNotifications.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Clients } from '../clients/schemas/clients.entity';
import { AppGateway } from '../app.gateway';
import * as moment from 'moment';

@Injectable()
export class SuperNotificationsService {
    constructor(
        private gateway: AppGateway,
        @InjectRepository(SuperNotifications)
        private readonly superNotificationsRepository: Repository<SuperNotifications>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
    ) {}

    async insertNotify(prev, current, title, resourceId, resource) {
        let client = null;
        let visit = null;
        if (resource == 'clients') {
            client = await this.clientsRepository.findOne(resourceId);
        } else {
            visit = await this.visitsRepository.findOne(resourceId);
        }
        if (prev != current) {
            const result = await this.superNotificationsRepository.insert({
                title: title,
                prevValue: prev,
                currentValue: current,
                visits: visit,
                clients: client,
                date: moment().format("YYYY-MM-DD HH:mm:ss")
            })
            this.gateway.handleMessageSuperNotification();
            return result;
        }
        return;
    }

    async getSuperNotificationss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `superNotifications.${orderBy}`;
        const [list, count] = await this.superNotificationsRepository
            .createQueryBuilder('superNotifications')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'superNotifications.clients',
                'clients'
            )
            .leftJoinAndSelect(
                'superNotifications.visits',
                'visits'
            )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('clients')) {
                    qb.andWhere(`clients.id = :id`, { id: parsedFilter.clients })
                }
                if (parsedFilter.hasOwnProperty('name')) {
                    qb.where(`superNotifications.prevValue ILIKE :name`, { name: `%${parsedFilter.name.trim()}%` })
                    qb.orWhere(`superNotifications.currentValue ILIKE :number`, { number: `%${parsedFilter.name.trim()}%` })
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManySuperNotifications(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.superNotificationsRepository.find({
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async getSuperNotifications(superNotificationsId: string) {
        const superNotifications = await this.findSuperNotifications(superNotificationsId);
        return superNotifications
    }

    async updateSuperNotifications(id, body): Promise<any> {
        const newData = body;
        return await this.superNotificationsRepository.save(newData);
    }

    async deleteSuperNotifications(superNotificationsId: string) {
        try {
            return await this.superNotificationsRepository.delete(superNotificationsId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteSuperNotificationss(superNotificationsIds): Promise<any> {
        const { ids } = superNotificationsIds;
        try {
            const result = await this.superNotificationsRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findSuperNotifications(id: string): Promise<SuperNotifications> {
        let superNotifications;
        try {
            superNotifications = await this.superNotificationsRepository.findOne(
                id, {
                relations: ['doctors'],
                // loadRelationIds: true,
            });
            return superNotifications;
        } catch (error) {
            throw new NotFoundException('Could not find superNotifications.');
        }
    }
}
