import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import * as fs from 'fs';

import { Visits, VisitStatus } from './schemas/visits.entity';
import { Clients, ClientsStatus } from '../clients/schemas/clients.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { AppGateway } from '../app.gateway';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { PriceLists } from '../priceLists/schemas/priceLists.entity';
import { PriceCalculationsService } from './priceCalculations.service';
import { Roles } from '../auth/schemas/roles.entity';
import { Attachments } from '../attachments/schemas/attachments.entity';
import { AttachmentsService } from '../attachments/attachments.service';
import { Treatments } from './schemas/treatments.entity';
import { Settings } from '../settings/schemas/settings.entity';
import { VisitsUtilsService } from './visitsUtils.service';
import { SuperNotificationsService } from '../superNotifications/superNotifications.service';


import { Fee } from './schemas/fee.entity';
import { Users } from '../auth/schemas/users.entity';
import { VisitsGoogleCalendarService } from './visitsGoogleCalendar.service';
const path = require('path');

@Injectable()
export class VisitsService {
    constructor(
        private gateway: AppGateway,
        private readonly priceCalculationsService: PriceCalculationsService,
        private readonly visitsUtilsService: VisitsUtilsService,
        private readonly visitsGoogleCalendarService: VisitsGoogleCalendarService,
        @Inject(SuperNotificationsService)
        private readonly superNotificationsService: SuperNotificationsService,
        @Inject(AttachmentsService)
        private readonly attachmentsService: AttachmentsService,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Insurance)
        private readonly insuranceRepository: Repository<Insurance>,
        @InjectRepository(PriceLists)
        private readonly priceListsRepository: Repository<PriceLists>,
        @InjectRepository(Attachments)
        private readonly attachmentsRepository: Repository<Attachments>,
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) { }

    async insertVisits(body) {
        if (body.clients) {
            const client = await this.clientsRepository.createQueryBuilder('clients')
                .leftJoinAndSelect(
                    'clients.visits',
                    'visits'
                )
                .leftJoinAndSelect(
                    'clients.clientsTemplates',
                    'clientsTemplates'
                )
                .leftJoinAndSelect(
                    'clientsTemplates.doctors',
                    'doctors'
                )
                .where('clients.id = :id', { id: body.clients })
                .orderBy('visits.startDate', 'DESC')
                .getOne();
            client.isFinished = ClientsStatus['NOTFINISHED'];
            body.clients = await this.clientsRepository.save(client);
        }
        if (body.insurance) {
            body.insurance = await this.insuranceRepository.findOne(body.insurance);
        }
        // if (body.doctors) {
        //     body.doctors = await this.doctorsRepository.findOne(body.doctors);
        //     if (body.doctors && body.doctors.googleToken) {
        //         const eventId = await this.visitsGoogleCalendarService.addEvent(body, body.doctors.googleToken);
        //         if (eventId) {
        //             body.googleCalendarEventId = eventId;
        //         }
        //     }
        // }
        const newVisits = this.visitsRepository.create({
            price: body.price,
            fee: body.fee,
            balance: body.balance,
            clients: body.clients,
            info: body.info,
            doctors: body.doctors,
            insurance: body.insurance,
            priceByDoctor: null,
            startDate: body.startDate,
            endDate: body.endDate,
            // googleCalendarEventId: body.googleCalendarEventId,
            lastVisitChecked: VisitStatus['LATE'],
            clientsTemplates: body.clients.clientsTemplates ?
                body.clients.clientsTemplates.doctors ?
                    body.clients.clientsTemplates.id : null : null,
            clientsTemplatesConfirmed: body.clients.clientsTemplates ?
                body.clients.clientsTemplates.confirmed ?
                    true : false : false
        });
        try {
            const result = await this.visitsRepository.save(newVisits);
            this.gateway.handleMessage();
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

    async updateVisitsRequest(body: any){
        return await this.visitsRepository.update(
            {
                id: In(body.ids),
            },
            { isClosedRequest: body.status },
        );
    }

    async getVisitss(filter: string, limit: string, page: string, orderBy: string, orderDir: string, userId: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `visits.${orderBy}`;

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
            .leftJoinAndSelect(
                'visits.clients',
                'clients',
                'clients.isDeleted = :isDeleted', { isDeleted: false }
            )
            .leftJoinAndSelect(
                'visits.feeHistory',
                'feeHistory'
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
                'visits.treatments',
                'treatments'
            )
            .where(qb => {
                qb.where('visits.isDeleted = :isDeleted', { isDeleted: false })
                qb.andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                if (parsedFilter.hasOwnProperty('startDate') && parsedFilter.hasOwnProperty('endDate')) {
                    qb.andWhere(`visits.startDate >= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD HH:mm:ss") })
                    qb.andWhere(`visits.endDate <= :dateEnd`, { dateEnd: moment(parsedFilter.endDate).format("YYYY-MM-DD 23:59:ss") })
                }
                if (roleData && roleData.name === 'doctor') {
                    qb.andWhere('doctors.id = :doctorId', { doctorId: roleData.user[0].doctors.id })
                }
                if (parsedFilter.hasOwnProperty('clients')) {
                    qb.andWhere(`clients.id = :clientId`, { clientId: parsedFilter.clients })
                }
                if (parsedFilter.hasOwnProperty('name') && parsedFilter.name.length >=2) {
                    qb.andWhere(`clients.name ILIKE :name`, { name: `%${parsedFilter.name.trim()}%` })
                    qb.orWhere(`clients.number ILIKE :number`, { number: `%${parsedFilter.name.trim()}%` })
                        .andWhere('clients.isDeleted = :isDeleted', { isDeleted: false })
                        .andWhere('visits.isDeleted = :isDeleted', { isDeleted: false })
                }
                if (parsedFilter.hasOwnProperty('discountForTreatment')) {
                    if (parsedFilter.discountForTreatment) {
                        qb.andWhere(`treatments.discountForTreatment > :discountForTreatment`, { discountForTreatment: 0 })
                    } else {
                        qb.andWhere(`treatments.discountForTreatment = :discountForTreatment`, { discountForTreatment: 0 })
                    }
                }
                if (parsedFilter.hasOwnProperty('treatmentWord') && parsedFilter.treatmentWord.length >=2) {
                    qb.andWhere(`treatments.treatmentName ILIKE :treatmentWord`, { treatmentWord: `%${parsedFilter.treatmentWord.trim()}%` })
                }
                if (parsedFilter.hasOwnProperty('balance')) {
                    if (parsedFilter['balance'] == false) {
                        qb.andWhere('visits.balance = :balance OR visits.balance ISNULL', { balance: 0 })
                    } else {
                        qb.andWhere('visits.balance > :balance', { balance: 0 })
                    }
                }
                if (parsedFilter.hasOwnProperty('doctors')) {
                    qb.andWhere(`doctors.id = :id`, { id: parsedFilter['doctors'] })
                }
                if (parsedFilter.hasOwnProperty('lastVisitChecked')) {
                    qb.andWhere(`visits.lastVisitChecked = :lastVisitChecked`, { lastVisitChecked: VisitStatus[parsedFilter.lastVisitChecked] })
                }
                if (parsedFilter.hasOwnProperty('treatmentsFilled')) {
                    qb.andWhere(`visits.treatmentsFilled = :treatmentsFilled`, { treatmentsFilled: parsedFilter.treatmentsFilled })
                }
                if (parsedFilter.hasOwnProperty('insurance')) {
                    qb.andWhere(`visits.insurance = :insurance`, { insurance: parsedFilter.insurance })
                }
                if (parsedFilter.hasOwnProperty('xRayCount')) {
                    if (parsedFilter['xRayCount'] == false) {
                        qb.andWhere('visits.xRayCount = :xRayCount OR visits.xRayCount ISNULL', { xRayCount: 0 })
                    } else {
                        qb.andWhere('visits.xRayCount > :xRayCount', { xRayCount: 0 })
                    }
                }
                if (parsedFilter.hasOwnProperty('isCash')) {
                    qb.andWhere('feeHistory.isCash = :isCash', { isCash: parsedFilter.isCash })
                }
                if (parsedFilter.hasOwnProperty('feeSentToDoctor')) {
                    qb.andWhere('feeHistory.feeSentToDoctor = :feeSentToDoctor', { feeSentToDoctor: parsedFilter.feeSentToDoctor })
                }
                if (parsedFilter.hasOwnProperty('feeSentToSalary')) {
                    qb.andWhere('feeHistory.feeSentToSalary = :feeSentToSalary', { feeSentToSalary: parsedFilter.feeSentToSalary })
                }
                if (parsedFilter.hasOwnProperty('closedInsuranceStatus')) {
                    qb.andWhere('treatments.insuranceForTreatment IS NOT NULL')
                    qb.andWhere('treatments.closedInsuranceStatus = :closedInsuranceStatus', { closedInsuranceStatus: parsedFilter.closedInsuranceStatus })
                }
                if (parsedFilter.hasOwnProperty('closedInsuranceXrayStatus')) {
                    qb.andWhere('visits.closeXRayCountInsurance = :closeXRayCountInsurance', { closeXRayCountInsurance: parsedFilter.closedInsuranceXrayStatus })
                }
                if (parsedFilter.hasOwnProperty('insuranceSalarySentToDoctor')) {
                    qb.andWhere('treatments.insuranceForTreatment IS NOT NULL')
                    if (parsedFilter['insuranceSalarySentToDoctor'] == false) {
                        qb.andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: false })
                        qb.andWhere('treatments.closedInsuranceStatus = :closedInsuranceStatus', { closedInsuranceStatus: true })
                    } else {
                        qb.andWhere('treatments.insuranceSalarySentToDoctor = :insuranceSalarySentToDoctor', { insuranceSalarySentToDoctor: true })
                        qb.andWhere('treatments.closedInsuranceStatus = :closedInsuranceStatus', { closedInsuranceStatus: true })
                    }
                }
                if (parsedFilter.hasOwnProperty('insuranceSentForSalary')) {
                    qb.andWhere('treatments.insuranceForTreatment IS NOT NULL')
                    if (parsedFilter['insuranceSentForSalary'] == false) {
                        qb.andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: false })
                        qb.andWhere('treatments.closedInsuranceStatus = :closedInsuranceStatus', { closedInsuranceStatus: true })
                    } else {
                        qb.andWhere('treatments.insuranceSentForSalary = :insuranceSentForSalary', { insuranceSentForSalary: true })
                        qb.andWhere('treatments.closedInsuranceStatus = :closedInsuranceStatus', { closedInsuranceStatus: true })
                    }
                }
                if (parsedFilter.hasOwnProperty('notifyAdminAboutPrice')) {
                    if (parsedFilter['notifyAdminAboutPrice'] == false) {
                        qb.andWhere('visits.notifyAdminAboutPrice = :notifyAdminAboutPrice', { notifyAdminAboutPrice: false })
                    } else {
                        qb.andWhere('visits.notifyAdminAboutPrice = :notifyAdminAboutPrice', { notifyAdminAboutPrice: true })
                    }
                }
                if (parsedFilter.hasOwnProperty('callClient')) {
                    if (parsedFilter['callClient'] == false) {
                        qb.andWhere('visits.callClient = :callClient OR visits.callClient ISNULL', { callClient: false })
                    } else {
                        qb.andWhere('visits.callClient = :callClient', { callClient: true })
                    }
                }
                if (parsedFilter.hasOwnProperty('callLab')) {
                    if (parsedFilter['callLab'] == false) {
                        qb.andWhere('visits.callLab = :callLab OR visits.callLab ISNULL', { callLab: false })
                    } else {
                        qb.andWhere('visits.callLab = :callLab', { callLab: true })
                    }
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyVisits(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.visitsRepository.find({
            where: { id: In(filterData.ids), isDeleted: false },
            order: {
                startDate: 'DESC'
            },
            relations: ['treatments', 'insurance', 'treatments.insuranceForTreatment'],
            loadRelationIds: {
                relations: ['doctors', 'clients']
            }
        });

        let { feeSum, xRayCount, xRayPrice, priceSumVisits } = await this.visitsRepository
            .createQueryBuilder('visits')
            .select("SUM(visits.fee)", "feeSum")
            .addSelect("SUM(visits.price)", "priceSumVisits")
            .addSelect("SUM(visits.xRayCount)", "xRayCount")
            .addSelect("SUM(visits.xRayPrice)", "xRayPrice")
            .where('visits.id IN (:...ids)', { ids: filterData.ids })
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
            .where('visits.id IN (:...ids)', { ids: filterData.ids })
            .andWhere("visits.isDeleted = :isDeleted", { isDeleted: false })
            .andWhere('treatments.insuranceForTreatment IS NULL')
            .andWhere('treatments.clientsTreatment = :client', { client: data[0].clients })
            .getRawOne();

        return {
            data,
            prices: {
                'Ռենտգեններ': xRayCount + ' - ' + xRayPrice,
                'Ընդամենը': realPriceSum !== null ? parseInt(realPriceSum) + parseInt(xRayPrice) : 0,
                'Վճարման ենթ․': payingPriceSum !== null ? parseInt(payingPriceSum) + parseInt(xRayPrice) : parseInt(priceSumVisits),
                'Վճարված է': feeSum,
            }
        };
    }

    async getVisits(visitsId: string, userId: string) {
        const visits = await this.findVisits(visitsId, userId);
        return visits
    }

    async updateVisits(id, body): Promise<any> {
        const newData = body;
        const visitData = await this.visitsRepository.findOne(newData.id);
        if (newData.lastVisitChecked !== VisitStatus['LATE']) {
            newData.finishedVisit = true;
        }
        if (newData.insurance) {
            newData.insurance = await this.insuranceRepository.findOne(newData.insurance);
            // if (newData.xRayCountInsuranceByDoctor != newData.xRayCountInsurance) {
            //     newData.notifyAdminAboutInsurancePrice = true;
            // } else {
            //     newData.notifyAdminAboutInsurancePrice = false;
            // }
        }
        if ((newData.newClientAttachment == null || newData.newClientAttachment.length === 0) && newData.clientAttachment && newData.clientAttachment.length !== 0) {
            const attachments = await this.attachmentsRepository
                .createQueryBuilder('attachments')
                .where({ id: In(body.visitAttachment) })
                .getMany();
            newData.visitAttachment = attachments === undefined ? null : attachments;
        }
        if (newData.newClientAttachment && newData.newClientAttachment.length !== 0) {
            const attachments = await this.attachmentsService.insertAttachment(newData, visitData, 'visitAttachment');
            newData.visitAttachment = attachments;
            delete newData.newClientAttachment;
        }
        if (newData.clients) {
            newData.clients = await this.priceCalculationsService.calculateBalance(newData);
            delete newData.deposit;
        }
        if (newData.doctors) {
            newData.doctors = await this.doctorsRepository.findOne(newData.doctors);
        }
        if (newData.feeHistory) {
            const oldFeeHistory = await this.feeRepository.find({
                relations: ['visitsFees'],
                loadRelationIds: true,
                where: {
                    visitsFees: newData.id
                }
            });
            const oldFeeHistoryIds = oldFeeHistory.map(el => el.id);
            if (newData.feeHistory.length != 0) {
                let currentbalance = 0
                for (let i = 0; i < newData.feeHistory.length; i++) {
                    newData.feeHistory[i].visitsFees = newData.id;
                    if (currentbalance == 0) {
                        currentbalance = newData.price - newData.feeHistory[i].feeValue;
                    } else {
                        currentbalance = currentbalance - newData.feeHistory[i].feeValue;
                    }
                    newData.feeHistory[i].currentBalance = currentbalance
                    await this.feeRepository.save(newData.feeHistory[i]);
                }
            }
            const feeHistoryIds = newData.feeHistory.map(el => el.id);
            const difference = oldFeeHistoryIds.filter(x => !feeHistoryIds.includes(x));
            if (difference.length !== 0) {
                await this.feeRepository.delete(difference)
            }
            newData.oldFeeHistory = await this.feeRepository.find({
                relations: ['visitsFees'],
                loadRelationIds: true,
                where: {
                    visitsFees: newData.id
                }
            });
        }
        if (newData.treatments) {
            const oldTreatments = await this.treatmentsRepository.find({
                relations: ['priceListsForOneTreatment', 'insuranceForTreatment'],
                loadRelationIds: true,
                where: {
                    visits: newData.id
                }
            });
            const oldTreatmentsIds = oldTreatments.map(el => el.id);
            if (newData.treatments.length != 0) {
                for (let i = 0; i < newData.treatments.length; i++) {
                    newData.treatments[i].visits = newData.id;
                    if (newData.treatments[i].discountForTreatment == '') {
                        newData.treatments[i].discountForTreatment = 0;
                    }
                    if (newData.treatments[i].insuranceForTreatment == '') {
                        newData.treatments[i].insuranceForTreatment = null;
                    }
                    if (newData.treatments[i].insurancePriceForTreatment == '') {
                        newData.treatments[i].insurancePriceForTreatment = 0;
                    }
                    if (newData.treatments[i].priceListsForOneTreatment == '') {
                        newData.treatments[i].priceListsForOneTreatment = [];
                    }
                    if (newData.treatments[i].createdAt == '') {
                        delete newData.treatments[i].createdAt;
                        delete newData.treatments[i].updatedAt;
                    }
                    if (newData.treatments[i].insuranceForTreatment != null) {
                        newData.treatments[i].insuranceForTreatment = await this.insuranceRepository.findOne(newData.treatments[i].insuranceForTreatment);
                    }
                    if (newData.treatments[i].priceListsForOneTreatment && newData.treatments[i].priceListsForOneTreatment.length !== 0) {
                        newData.treatments[i].priceListsForOneTreatment = await this.priceListsRepository.findByIds(newData.treatments[i].priceListsForOneTreatment);
                    }
                    if (newData.treatments[i].insuranceSentForSalaryDate == '') {
                        newData.treatments[i].insuranceSentForSalaryDate = null
                    }
                    newData.treatments[i].clientsTreatment = newData.clients;
                    newData.treatments[i].doctorsTreatment = newData.doctors;
                    await this.treatmentsRepository.save(newData.treatments[i]);
                }
                const treatmentsIds = newData.treatments.map(el => el.id);
                const difference = oldTreatmentsIds.filter(x => !treatmentsIds.includes(x));
                if (difference.length !== 0) {
                    await this.treatmentsRepository.delete(difference)
                }
                newData.treatments = await this.treatmentsRepository.find({
                    relations: ['priceListsForOneTreatment', 'insuranceForTreatment'],
                    loadRelationIds: true,
                    where: {
                        visits: newData.id
                    }
                });
                newData.treatmentsFilled = true;
            } else {
                if (oldTreatmentsIds.length !== 0) {
                    await this.treatmentsRepository.delete(oldTreatmentsIds)
                }
                newData.treatmentsFilled = false;
            }
        }
        if (newData.priceChanged) {
            await this.superNotificationsService.insertNotify(newData.previousPrice, newData.price, 'Արժեքի փոփոխություն', newData.id, 'visits');
            delete newData.googleCalendarEventId;
        }
        if (newData.balanceNotifyChanged) {
            await this.superNotificationsService.insertNotify(newData.previousBalancePrice, newData.balance, 'Մնացորդի փոփոխություն', newData.clients.id, 'clients');
            delete newData.googleCalendarEventId;
        }
        if (newData.priceByDoctor != null) {
            const settingsData = await this.settingsRepository.find();
            const allValueByDoctor = newData.priceByDoctor + (newData.xRayCountByDoctor * (settingsData.length !== 0 ? settingsData[0].xRayPrice : 1000));
            if (newData.price == null) {
                newData.notifyAdminAboutPrice = true;
            } else if (allValueByDoctor > newData.price || allValueByDoctor < newData.price) {
                newData.notifyAdminAboutPrice = true;
            } else if (allValueByDoctor == newData.price) {
                newData.notifyAdminAboutPrice = false;
            }
            delete newData.googleCalendarEventId;
        }
        // Google Calendar
        if (newData.googleCalendarEventId) {
            if (newData.doctorsChanged) {
                const previousDoctors = await this.doctorsRepository.findOne(newData.previousDoctors);
                await this.visitsGoogleCalendarService.deleteEvent(newData.googleCalendarEventId, previousDoctors.googleToken, previousDoctors)
                const eventId = await this.visitsGoogleCalendarService.addEvent(newData, previousDoctors.googleToken);
                if (eventId) {
                    newData.googleCalendarEventId = eventId;
                }
            } else if (newData.doctors && newData.doctors.googleToken) {
                await this.visitsGoogleCalendarService.updateEvent(newData, newData.doctors.googleToken)
            }
        }
        const result = await this.visitsRepository.save(newData);
        await this.visitsUtilsService.updateClientStatus(result.id);
        this.gateway.handleMessage();
        return result;
    }

    async removeAttachment(filePath) {
        fs.stat(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err, stats) => {
            if (err) {
                return
            }
            fs.unlink(path.resolve(process.env.ATTACHMENTS_PATH) + '/' + filePath, (err) => {
                if (err) return console.log(err);
            });
        });
    }

    async removePreviousInsertedFile(body) {
        await this.removeAttachment(body.attachment)
        await this.removeAttachment(body.thumbnail)
    }

    async deleteVisits(visitsId: string) {
        const visits = await this.visitsRepository.findOne(visitsId, {
            relations: ['clients', 'doctors', 'visitAttachment'],
            loadRelationIds: true
        });
        try {
            let result;
            if (visits.price == null) {
                result = await this.visitsRepository.delete(visitsId);
            } else {
                result = await this.visitsRepository.update(visitsId, {
                    isDeleted: true
                });
                await this.attachmentsService.deleteAttachments(visits.visitAttachment)
            }
            await this.priceCalculationsService.updateBalanceFromDeletedVisits([visits]);
            // Google Calendar
            if (visits.googleCalendarEventId) {
                if (visits.doctors && visits.doctors.googleToken) {
                    await this.visitsGoogleCalendarService.deleteEvent(visits.googleCalendarEventId, visits.doctors.googleToken, visits.doctors.calendarId)
                }
            }
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

    async deleteVisitss(visitsIds): Promise<any> {
        const { ids } = visitsIds;
        const visits = await this.visitsRepository.findByIds(ids, {
            relations: ['clients', 'doctors', 'visitAttachment']
        });
        try {
            let result;
            if (visits.length !== 0) {
                await this.priceCalculationsService.updateBalanceFromDeletedVisits(visits);
            }
            for (let i = 0; i < visits.length; i++) {
                // changed
                if (visits[i]?.price == null) {
                    result = await this.visitsRepository.delete(visits[i]?.id);
                } else {
                    result = await this.visitsRepository.update({
                        id: In(ids),
                    },
                        { isDeleted: true },
                    );
                }
                await this.attachmentsService.deleteAttachments(visits[i].visitAttachment)
                if (visits[i].googleCalendarEventId) {
                    if (visits[i].doctors && visits[i].doctors.googleToken) {
                        await this.visitsGoogleCalendarService.deleteEvent(visits[i].googleCalendarEventId, visits[i].doctors.googleToken, visits[i].doctors)
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

    private async findVisits(id: string, userId: string): Promise<Visits> {
        let visits;
        try {
            visits = await this.visitsRepository
                .createQueryBuilder('visits')
                .loadAllRelationIds({
                    relations: ['doctors', 'insurance', 'clients', 'visitAttachment']
                })
                .leftJoinAndSelect(
                    'visits.feeHistory',
                    'feeHistory'
                )
                .leftJoinAndSelect(
                    'visits.clientsTemplates',
                    'clientsTemplates'
                )
                .leftJoinAndSelect(
                    'visits.treatments',
                    'treatments'
                )
                .leftJoinAndSelect(
                    'treatments.priceListsForOneTreatment',
                    'priceListsForOneTreatment'
                )
                .leftJoinAndSelect(
                    'treatments.insuranceForTreatment',
                    'insuranceForTreatment'
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
                    'visits.visitAttachment',
                    'visitAttachment'
                )
                .where('visits.id = :id', { id: id })
                .orderBy('feeHistory.id', 'ASC')
                .getOne()

            const refactorToIds = visits.treatments.map((item) => {
                if (item.insuranceForTreatment) {
                    item.insuranceForTreatment = item.insuranceForTreatment.id;
                    if (item.priceListsForOneTreatment.length !== 0) {
                        item.priceListsForOneTreatment = item.priceListsForOneTreatment.map(el => el.id);
                    }
                }
                return item;
            })
            visits.treatments = refactorToIds;
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
                .getOne();

            if (roleData.name == 'doctor' && visits.doctors !== roleData.user[0].doctors.id) {
                visits.disabled = true;
            } else {
                visits.disabled = false
            }
            return visits;
        } catch (error) {
            throw new NotFoundException('Could not find visits.');
        }
    }
}
