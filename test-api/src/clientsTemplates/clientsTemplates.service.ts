import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ClientsTemplates } from './schemas/clientsTemplates.entity';


import { Doctors } from '../doctors/schemas/doctors.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { Clients } from '../clients/schemas/clients.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { AppGateway } from '../app.gateway';

@Injectable()
export class ClientsTemplatesService {
    constructor(
        private gateway: AppGateway,
        @InjectRepository(ClientsTemplates)
        private readonly clientsTemplatesRepository: Repository<ClientsTemplates>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(DoctorSalaries)
        private readonly doctorSalariesRepository: Repository<DoctorSalaries>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
    ) { }

    async insertClientsTemplates(body) {
        if (body.doctors) {
            body.doctors = await this.doctorsRepository.findOne(body.doctors)
        }
        const newclientsTemplates = this.clientsTemplatesRepository.create({
            name: body.name,
            doctors: body.doctors,
            percentage: body.percentage,
            confirmed: body.confirmed
        });
        try {
            const result = await this.clientsTemplatesRepository.save(newclientsTemplates);
            this.gateway.handleMessage()
            return result;
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getClientsTemplatess(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `clientsTemplates.${orderBy}`;
        const [list, count] = await this.clientsTemplatesRepository
            .createQueryBuilder('clientsTemplates')
            .skip(skipNumber)
            .take(maxNumber)
            .leftJoinAndSelect(
                'clientsTemplates.doctors',
                'doctors'
            )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('confirmed')) {
                    qb.where(`clientsTemplates.confirmed = :confirmed`, { confirmed: parsedFilter.confirmed })
                    qb.andWhere(`clientsTemplates.doctors IS NOT NULL`)
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyClientsTemplates(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.clientsTemplatesRepository.find({
            where: { id: In(filterData.ids) },
            relations: ['doctors'],
        });
        return {
            data
        };
    }

    async getClientsTemplates(clientsTemplatesId: string) {
        const clientsTemplates = await this.findClientsTemplates(clientsTemplatesId);
        return clientsTemplates
    }

    async updateClientsTemplates(id, body): Promise<any> {
        const newData = body;
        if (newData.doctors) {
            newData.doctors = await this.doctorsRepository.findOne(newData.doctors)
        }
        if (newData.clients) {
            newData.clients = await this.clientsRepository.findByIds(newData.clients)
        }
        if (newData.visits) {
            newData.visits = await this.visitsRepository.findByIds(newData.visits)
        }
        if (newData.doctorSalaries) {
            newData.doctorSalaries = await this.doctorSalariesRepository.findByIds(newData.doctorSalaries)
        }
        // if (newData.confirmedChanged) {
        //     const notConfirmedAndNotSentToDoctor = await this.visitsRepository
        //         .createQueryBuilder('visits')
        //         .leftJoin('visits.feeHistory', 'fee')
        //         .leftJoin('visits.clientsTemplates', 'clientsTemplates')
        //         .groupBy('visits.id')
        //         .where('clientsTemplates.id = :id', { id: newData.id })
        //         .having('SUM(CASE WHEN fee.feeSentToDoctor = true THEN 1 ELSE 0 END) = 0')
        //         .getMany()
        //     if (notConfirmedAndNotSentToDoctor.length !== 0) {
        //         const notConfirmedAndNotSentToDoctorIds = notConfirmedAndNotSentToDoctor.map(el => el.id);
        //         await this.visitsRepository.update(
        //             {
        //                 id: In(notConfirmedAndNotSentToDoctorIds),
        //             },
        //             { clientsTemplatesConfirmed: newData.confirmed },
        //         );
        //         this.gateway.handleMessageClientsTemplate();
        //     }
        // }
        const result = await this.clientsTemplatesRepository.save(newData);
        this.gateway.handleMessageCloseModalsWhenUpdate();
        this.gateway.handleMessage();
        return result;
    }

    async deleteClientsTemplates(clientsTemplatesId: string) {
        try {
            const result = await this.clientsTemplatesRepository.delete(clientsTemplatesId);
            this.gateway.handleMessage();
            return result;
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteClientsTemplatess(clientsTemplatesIds): Promise<any> {
        const { ids } = clientsTemplatesIds;
        try {
            const result = await this.clientsTemplatesRepository.delete(ids);
            this.gateway.handleMessage();
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findClientsTemplates(id: string): Promise<ClientsTemplates> {
        let clientsTemplates;
        try {
            clientsTemplates = await this.clientsTemplatesRepository.findOne(
                id, {
                relations: ['doctors', 'clients', 'doctorSalaries', 'visits'],
                loadRelationIds: true
            });
            return clientsTemplates;
        } catch (error) {
            throw new NotFoundException('Could not find clientsTemplates.');
        }
    }
}
