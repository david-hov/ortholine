import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as moment from 'moment';

import { Clients, ClientsStatus } from './schemas/clients.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { Visits, VisitStatus } from '../visits/schemas/visits.entity';
import { AppGateway } from '../app.gateway';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';
import { AttachmentsService } from '../attachments/attachments.service';
import { Treatments } from '../visits/schemas/treatments.entity';
import { search } from '../utils/utils';


import { SuperNotificationsService } from '../superNotifications/superNotifications.service';
import { Deposits } from '../deposits/schemas/deposits.entity';
import { Fee } from '../visits/schemas/fee.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
const path = require('path');

@Injectable()
export class ClientsService {
    constructor(
        private gateway: AppGateway,
        @Inject(AttachmentsService)
        private readonly attachmentsService: AttachmentsService,
        @Inject(SuperNotificationsService)
        private readonly superNotificationsService: SuperNotificationsService,
        @InjectRepository(Deposits)
        private readonly depositsRepository: Repository<Deposits>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
        @InjectRepository(Attachments)
        private readonly attachmentsRepository: Repository<Attachments>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(ClientsTemplates)
        private readonly clientsTemplatesRepository: Repository<ClientsTemplates>,
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
    ) {}

    async insertClients(body) {
        if (body.attachment) {
            const uuid = uuidv4();
            const realPath = uuid + `.${body.attachment.type.split('/')[1]}`;
            const savedFile = await new Promise(function (resolve, reject) {
                fs.writeFile(path.resolve(`${process.env.ATTACHMENTS_PATH}`) + '/' + realPath, body.attachment.data, 'base64', function (err) {
                    if (err) reject(err);
                    else resolve(realPath);
                });
            });
            body.attachment_type = body.attachment.type.split('/')[1];
            body.attachment = savedFile;
        }
        if (body.clientsTemplates) {
            body.clientsTemplates = await this.clientsTemplatesRepository.findOne(body.clientsTemplates)
        }
        const newClients = this.clientsRepository.create({
            name: body.name,
            number: body.number,
            birthDate: body.birthDate,
            nameForClientView: body.nameForClientView,
            clientsTemplates: body.clientsTemplates,
            notes: null,
            isWaiting: false,
            deposit: body.deposit,
            orthodontia: body.orthodontia,
            diagnosis: body.diagnosis,
            future: body.future,
            healthStatus: body.healthStatus,
            orthopedia: body.orthopedia,
            implant: body.implant,
            extraInfo: body.extraInfo,
        });
        // data import
        // try {
        //     const result = await this.clientsRepository.save(newClients);
        //     const treatments = JSON.parse(body.treatments);
        //     if (treatments.length !== 0) {
        //         const doctor = await this.doctorsRepository.findOne(1)
        //         const visit = await this.visitsRepository.save({
        //             clients: result,
        //             startDate: body.startDate,
        //             endDate: body.endDate,
        //             lastVisitChecked: VisitStatus['CAME'],
        //             treatmentsFilled: true,
        //             doctors: doctor
        //         });
        //         for (const item of JSON.parse(body.treatments)) {
        //             await this.treatmentsRepository.save({
        //                 treatmentName: item.treatmentName,
        //                 realPriceForTreatment: item.realPriceForTreatment,
        //                 payingPriceForTreatment: item.realPriceForTreatment,
        //                 visits: visit
        //             })
        //         }
        //     }
        //     return result;
        // } catch (error) {
        //     console.log(error)
        //     if (error.code == 23505) {
        //         let message = error.detail.split("=(").pop();
        //         if (message) {
        //             let number = message.substring(0, message.indexOf(")"))
        //             throw new ConflictException(`Տվյալ համարը - ${number} արդեն գրանցված է`)
        //         }
        //         throw new ConflictException(error.detail)
        //     } else {
        //         throw new HttpException('Something went wrong', 500)
        //     }
        // }
        try {
            return await this.clientsRepository.save(newClients);
        } catch (error) {
            if (error.code == 23505) {
                let message = error.detail.split("=(").pop();
                if (message) {
                    let number = message.substring(0, message.indexOf(")"))
                    throw new ConflictException(`Տվյալ համարը - ${number} արդեն գրանցված է`)
                }
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getClientss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `clients.${orderBy}`;

        const [list, count] = await this.clientsRepository
            .createQueryBuilder('clients')
            .skip(skipNumber)
            .take(maxNumber)
            // changed
            .loadAllRelationIds({
                relations: parsedFilter.hasOwnProperty('isFinished') ? ['clientsTemplates', 'clientAttachment', 'clientsDeposits'] : ['visits', 'clientsTemplates', 'clientAttachment', 'clientsDeposits']
            })
            // changed
            .leftJoinAndSelect(
                'clients.visits',
                'visits',
            )
            .leftJoinAndSelect(
                'clients.clientsTemplates',
                'clientsTemplates',
                `clients.isDeleted = :isDeleted`, { isDeleted: false }
            )
            .leftJoinAndSelect(
                'clients.clientAttachment',
                'clientAttachment'
            )
            .leftJoinAndSelect(
                'clients.clientsDeposits',
                'clientsDeposits'
            )
            .where(qb => {
                qb.where('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('isFinished')) {
                    // changed
                    qb.andWhere(`clients.isFinished = :finished`, { finished: parsedFilter.isFinished })
                    qb.andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                }
                if (parsedFilter.hasOwnProperty('fromClinic')) {
                    qb.andWhere(`clientsDeposits.fromClinic = :fromClinic`, { fromClinic: parsedFilter['fromClinic'] })
                }
                if (parsedFilter.hasOwnProperty('isWaiting')) {
                    qb.andWhere(`clients.isWaiting = :waiting`, { waiting: parsedFilter['isWaiting'] })
                }
                if (parsedFilter.hasOwnProperty('q')) {
                    qb.andWhere(`clients.name ILIKE :name`, { name: `%${parsedFilter.q.trim()}%` })
                }
                if (parsedFilter.hasOwnProperty('birthDate')) {
                    qb.andWhere(`clients.birthDate = :birthDate`, { birthDate: parsedFilter['birthDate'] })
                }
                if (parsedFilter.hasOwnProperty('name') && parsedFilter.name.length >=2) {
                    qb.andWhere(`clients.name ILIKE :name`, { name: `%${parsedFilter.name.trim()}%` })
                    qb.orWhere(`clientsTemplates.name ILIKE :clientInfoName`, { clientInfoName: `%${parsedFilter.name.trim()}%` })
                    qb.orWhere(`clients.number ILIKE :number`, { number: `%${parsedFilter.name.trim()}%` })
                        .andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                }
                if (parsedFilter.hasOwnProperty('insurance')) {
                    qb.andWhere(`visits.insurance = :insurance`, { insurance: parsedFilter.insurance })
                }
                if (parsedFilter.hasOwnProperty('clientsTemplates')) {
                    qb.andWhere(`clients.clientsTemplates = :clientsTemplatesId`, { clientsTemplatesId: parsedFilter.clientsTemplates })
                }
                if (parsedFilter.hasOwnProperty('balance')) {
                    if (parsedFilter['balance'] == false) {
                        qb.andWhere('clients.balance = :balance', { balance: 0 })
                    } else {
                        qb.andWhere('clients.balance > :balance', { balance: 0 })
                    }
                }
                if (parsedFilter.hasOwnProperty('complaint')) {
                    if (parsedFilter['complaint'] == false) {
                        qb.andWhere('clients.complaint ISNULL')
                    } else {
                        qb.andWhere('clients.complaint IS NOT NULL')
                    }
                }
                if (parsedFilter.hasOwnProperty('deposit')) {
                    if (parsedFilter['deposit'] == false) {
                        qb.andWhere('clients.deposit = :deposit OR clients.deposit ISNULL', { deposit: 0 })
                    } else {
                        qb.andWhere('clients.deposit > :deposit', { deposit: 0 })
                    }
                }
                if (parsedFilter.hasOwnProperty('rememberNotes')) {
                    if (parsedFilter.rememberNotes == true) {
                        qb.andWhere("clients.extraInfo != :extraInfo", { extraInfo: '[]' })
                    } else {
                        qb.andWhere("clients.extraInfo = :extraInfo", { extraInfo: '[]' })
                    }
                }
                if (parsedFilter.hasOwnProperty('future')) {
                    if (parsedFilter.future == true) {
                        qb.andWhere("clients.future != :future", { future: '[]' })
                    } else {
                        qb.andWhere("clients.future = :future", { future: '[]' })
                    }
                }
                if (parsedFilter.hasOwnProperty('diagnosis')) {
                    if (parsedFilter.diagnosis == true) {
                        qb.andWhere("clients.diagnosis != :diagnosis", { diagnosis: '[]' })
                    } else {
                        qb.andWhere("clients.diagnosis = :diagnosis", { diagnosis: '[]' })
                    }
                }
                if (parsedFilter.hasOwnProperty('searchInFutureDiagnosis')) {
                    qb.andWhere(`clients.future::jsonb @@ '$.text like_regex "${parsedFilter.searchInFutureDiagnosis.trim()}"'`)
                    qb.orWhere(`clients.diagnosis::jsonb @@ '$.diagnose like_regex "${parsedFilter.searchInFutureDiagnosis.trim()}"'`)
                        .andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                }
                if (parsedFilter.hasOwnProperty('orthodontia') || parsedFilter.hasOwnProperty('orthopedia')
                    || parsedFilter.hasOwnProperty('implant')) {
                    search(qb, parsedFilter, Object.keys(parsedFilter)[0])
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .addOrderBy('visits.startDate', 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyClients(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.clientsRepository.find({
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async getClients(clientsId: string) {
        const clients = await this.findClients(clientsId);
        return clients
    }

    async getClientsTemplate(clientsId: string) {
        const clients = await this.clientsRepository.findOne(clientsId, {
            relations: ['clientsTemplates', 'clientsTemplates.doctors'],
        });
        return clients
    }

    async getClientsFee(clientsId: string) {
        let { feeSum, xRayPrice } = await this.visitsRepository
            .createQueryBuilder('visits')
            .select("SUM(visits.fee)", "feeSum")
            .addSelect("SUM(visits.xRayPrice)", "xRayPrice")
            .where('visits.clients = :clients', { clients: clientsId })
            .andWhere("visits.isDeleted = :isDeleted", { isDeleted: false })
            .getRawOne();

        let { realPriceSum, payingPriceSum } = await this.treatmentsRepository
            .createQueryBuilder('treatments')
            .leftJoinAndSelect(
                'treatments.visits',
                'visits'
            )
            .select("SUM(treatments.realPriceForTreatment)", "realPriceSum")
            .addSelect("SUM(treatments.payingPriceForTreatment)", "payingPriceSum")
            .where('treatments.insuranceForTreatment IS NULL')
            .andWhere("visits.isDeleted = :isDeleted", { isDeleted: false })
            .andWhere('treatments.clientsTreatment = :clientsTreatment', { clientsTreatment: clientsId })
            .getRawOne();

        let { insurancePriceByDoctor } = await this.treatmentsRepository
            .createQueryBuilder('treatments')
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'treatments.visits',
                'visits'
            )
            .leftJoinAndSelect(
                'visits.clients',
                'clients'
            )
            .select("SUM(treatments.payingPriceForTreatment)", "insurancePriceByDoctor")
            .where('clients.id = :id', { id: clientsId })
            .andWhere("visits.isDeleted = :isDeleted", { isDeleted: false })
            .andWhere('treatments.insuranceForTreatment IS NOT NULL')
            .getRawOne();

        return {
            clinic: {
                'Ընդամենը': realPriceSum !== null ? parseInt(realPriceSum) + parseInt(xRayPrice) : 0,
                'Վճարման ենթ․': payingPriceSum !== null ? parseInt(payingPriceSum) + parseInt(xRayPrice) : 0,
                'Վճարված է': parseInt(feeSum),
            },
            insurance: {
                'Ընդամենը': insurancePriceByDoctor
            }
        };
    }

    async removeAttachment(filePath) {
        return fs.stat(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err, stats) => {
            if (err) {
                return
            }
            fs.unlink(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err) => {
                if (err) return console.log(err);
            });
        });
    }

    async removePreviousInsertedFile(body) {
        let a = this.removeAttachment(body.src)
        let b = this.removeAttachment(body.thumbnail)
        return await Promise.all([a,b])
    }

    async restartClientsDeposit(id) {
        return await this.clientsRepository.update(id, {
            deposit: 0
        })
    }

    async updateClients(id, body): Promise<any> {
        const newData = body;
        const clientsData = await this.clientsRepository.findOne(newData.id);
        if ((newData.newClientAttachment == null || newData.newClientAttachment.length === 0) && newData.clientAttachment && newData.clientAttachment.length !== 0) {
            const attachments = await this.attachmentsRepository
                .createQueryBuilder('attachments')
                .where({ id: In(body.clientAttachment) })
                .getMany();
            newData.clientAttachment = attachments === undefined ? null : attachments;
        }
        if (newData.visits) {
            newData.visits = await this.visitsRepository.findByIds(body.visits)
        }
        if (newData.clientsDeposits) {
            newData.clientsDeposits = await this.depositsRepository.findByIds(newData.clientsDeposits)
        }
        if (newData.depositChanged) {
            let message;
            let totalToBalance = 0;
            const depositValue = newData.deposit;
            const visitsWithBalance = await this.visitsRepository.find({
                where: {
                    clients: clientsData,
                    balance: MoreThan(0)
                },
                order: {
                    'startDate': 'ASC'
                },
                relations: ['clients'],
                loadRelationIds: true
            })
            if (visitsWithBalance.length !== 0) {
                for (let i = 0; i < visitsWithBalance.length; i++) {
                    if (newData.deposit <= 0) {
                        newData.deposit = 0;
                        break;
                    }
                    newData.deposit = newData.deposit - visitsWithBalance[i].balance;
                    let newBalance = newData.deposit > 0 ? 0 : Math.abs(newData.deposit);
                    const fee = {
                        feeValue: visitsWithBalance[i].balance - newBalance,
                        date: moment(),
                        feeSentToDoctor: newData.fromClinic,
                        feeSentToSalary: false,
                        visitsFees: visitsWithBalance[i],
                        feeSentForSalaryDate: null,
                        currentBalance: newBalance,
                        fromClinic: newData.fromClinic
                    }
                    totalToBalance = totalToBalance + fee.feeValue;
                    newData.balance = newData.balance - (visitsWithBalance[i].balance - newBalance);
                    visitsWithBalance[i].balance = newBalance;
                    visitsWithBalance[i].fee = visitsWithBalance[i].fee + fee.feeValue;
                    await this.visitsRepository.update(visitsWithBalance[i].id, {
                        balance: newBalance,
                        fee: visitsWithBalance[i].fee
                    });
                    await this.feeRepository.insert(fee);
                }
                message = `${newData.fromClinic ? 'Կլինիկայի կողմից' : ''} Գումարի ՄՈՒՏՔ պացիենտի կանխավճար (${depositValue} դր․), որից պարտքի մարում ${totalToBalance} դր․`
                if (newData.deposit < 0) {
                    newData.deposit = 0
                }
            } else {
                if (newData.previousDeposit > newData.deposit) {
                    message = 'Գումարի ԵԼՔ պացիենտի կանխավճարից';
                } else {
                    message = 'Գումարի ՄՈՒՏՔ պացիենտի կանխավճար';
                }
            }
            await this.depositsRepository.insert({
                value: newData.minus,
                balanceMessage: message,
                inputDate: moment().format('YYYY-MM-DD'),
                clients: newData.id,
                fromClinic: newData.fromClinic
            })
            newData.clientsDeposits = await this.depositsRepository.find({
                where: {
                    clients: newData.id
                }
            })
            await this.superNotificationsService.insertNotify(newData.previousDeposit, totalToBalance > 0 ? Math.abs(totalToBalance - depositValue) : depositValue, message, newData.id, 'clients')
        }
        if (newData.treatments) {
            newData.treatments = await this.treatmentsRepository.findByIds(newData.treatments)
        }
        if (newData.clientsTemplates) {
            newData.clientsTemplates = await this.clientsTemplatesRepository.findOne(newData.clientsTemplates)
        }
        if (newData.newClientAttachment && newData.newClientAttachment.length !== 0) {
            const attachments = await this.attachmentsService.insertAttachment(newData, clientsData, 'clientAttachment');
            newData.clientAttachment = attachments;
            delete newData.newClientAttachment;
        }
        const result = await this.clientsRepository.save(newData);
        this.gateway.handleMessage();
        return result;
    }

    async deleteClients(clientsId: string) {
        try {
            const result = await this.clientsRepository.update(clientsId, {
                isDeleted: true,
                number: null,
                isFinished: ClientsStatus['FINISHED'],
                isWaiting: false
            });
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

    async deleteClientss(clientsIds): Promise<any> {
        const { ids } = clientsIds;
        const clientsData = await this.clientsRepository.findByIds(ids, {
            relations: ['clientAttachment', 'visits']
        });
        try {
            const result = await this.clientsRepository.update({
                id: In(ids),
              },
              {
                isDeleted: true,
                number: null,
                isFinished: ClientsStatus['FINISHED'],
                isWaiting: false  },
            );
            if (clientsData.length !== 0) {
                for (let i = 0; i < clientsData.length; i++) {
                    if (clientsData[i].clientAttachment && clientsData[i].clientAttachment.length !== 0) {
                        for (let j = 0; i < clientsData[i].clientAttachment.length; j++) {
                            await this.removePreviousInsertedFile(clientsData[i].clientAttachment[j])
                        }
                    }
                }
            }
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

    private async findClients(id: string): Promise<Clients> {
        let clients;
        try {
            clients = await this.clientsRepository.findOne(
                id, {
                relations: ['visits', 'clientAttachment', 'clientsTemplates', 'clientsDeposits'],
                loadRelationIds: true,
            });
            return clients;
        } catch (error) {
            throw new NotFoundException('Could not find clients.');
        }
    }
}