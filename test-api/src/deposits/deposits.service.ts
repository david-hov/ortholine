import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Deposits } from './schemas/deposits.entity';
import { Clients } from '../clients/schemas/clients.entity';

@Injectable()
export class DepositsService {
    constructor(
        @InjectRepository(Deposits)
        private readonly depositsRepository: Repository<Deposits>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>
    ) {}

    async insertDeposits(body) {
        if (body.clients) {
            body.clients = await this.clientsRepository.findOne(body.clients);
        }
        const newDeposits = this.depositsRepository.create({
            value: body.value,
            inputDate: body.inputDate,
            balanceMessage: body.balanceMessage,
            clients: body.clients
        });
        try {
            return await this.depositsRepository.save(newDeposits);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getDepositss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = orderBy !== 'doctors'
            ? `deposits.${orderBy}` : `${orderBy}.id`;
        const [list, count] = await this.depositsRepository
            .createQueryBuilder('deposits')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'deposits.doctors',
                'doctors'
            )
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyDeposits(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.depositsRepository.find({
            where: {
                id: In(filterData.ids),
            },
            order: {
                id: 'DESC'
            }
        });
        return {
            data
        };
    }

    async getDeposits(depositsId: string) {
        const deposits = await this.findDeposits(depositsId);
        return deposits
    }

    async updateDeposits(id, body): Promise<any> {
        const newData = body;
        if (newData.doctors) {
            newData.doctors = await this.clientsRepository.findByIds(newData.doctors);
        }
        return await this.depositsRepository.save(newData);
    }

    async deleteDeposits(depositsId: string) {
        try {
            return await this.depositsRepository.delete(depositsId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteDepositss(depositsIds): Promise<any> {
        const { ids } = depositsIds;
        try {
            const result = await this.depositsRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findDeposits(id: string): Promise<Deposits> {
        let deposits;
        try {
            deposits = await this.depositsRepository.findOne(
                id, {
                relations: ['doctors'],
                // loadRelationIds: true,
            });
            return deposits;
        } catch (error) {
            throw new NotFoundException('Could not find deposits.');
        }
    }
}
