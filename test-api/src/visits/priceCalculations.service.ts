import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Clients } from '../clients/schemas/clients.entity';

import { Injectable } from '@nestjs/common';


@Injectable()
export class PriceCalculationsService {
    constructor(
        @InjectRepository(Clients)
        private readonly clientsRepository: Repository<Clients>,
    ) {}

    async calculateBalance(body: any) {
        let client = await this.clientsRepository.createQueryBuilder('clients')
            .where('clients.id = :id', { id: body.clients })
            .getOne();
        if (body.clientsChanged) {
            let previousClient = await this.clientsRepository.createQueryBuilder('clients')
                .where('clients.id = :id', { id: body.previousClients })
                .getOne();
            await this.clientsRepository.update(previousClient.id, {
                balance: previousClient.balance - body.balance
            });
            await this.clientsRepository.update(client.id, {
                balance: client.balance + body.balance
            });
            return client;
        } else {
            if (client) {
                if (body.balanceNotifyChanged) {
                    if (body.previousBalancePrice > body.balance) {
                        client.balance = client.balance - (body.previousBalancePrice - body.balance);
                    } else {
                        client.balance = client.balance + (body.balance - body.previousBalancePrice);
                    }
                }
            }
            await this.clientsRepository.update(client.id, {
                balance: client.balance
            });
            return client;
        }
    }

    // async calculateBalance(body: any) {
    //     let client = await this.clientsRepository.createQueryBuilder('clients')
    //         .leftJoinAndSelect('clients.visits', 'visits')
    //         .where('clients.id = :id', { id: body.clients })
    //         .orderBy('visits.startDate', 'DESC')
    //         .getOne()

    //     if (body.clientsChanged) {
    //         if (body.balance < 0) {
    //             const previousClient = await this.clientsRepository.findOne(body.previousClients);
    //             await this.clientsRepository.update(previousClient.id, {
    //                 deposit: previousClient.deposit - Math.abs(body.balance)
    //             });
    //             await this.clientsRepository.update(client.id, {
    //                 deposit: client.deposit + Math.abs(body.balance)
    //             });
    //         }
    //     }
    //     if (body.balanceChanged) {
    //         let balanceValue;
    //         if (body.balance < 0) {
    //             if (Math.abs(body.previousBalancePrice) > Math.abs(body.balance)) {
    //                 if (body.previousBalancePrice > 0) {
    //                     client.deposit = client.deposit + Math.abs(body.balance);
    //                 } else {
    //                     balanceValue = Math.abs(body.previousBalancePrice) - Math.abs(body.balance);
    //                     client.deposit = client.deposit - balanceValue;
    //                 }
    //             } else if (Math.abs(body.previousBalancePrice) < Math.abs(body.balance)) {
    //                 if (body.previousBalancePrice > 0) {
    //                     client.deposit = client.deposit + Math.abs(body.balance);
    //                 } else {
    //                     balanceValue = Math.abs(body.balance) - Math.abs(body.previousBalancePrice);
    //                     client.deposit = client.deposit + balanceValue;
    //                 }
    //             } else {
    //                 client.deposit = client.deposit + Math.abs(body.balance);
    //             }
    //         } else if (body.balance > 0) {
    //             if (Math.abs(body.previousBalancePrice) < Math.abs(body.balance)) {
    //                 balanceValue = Math.abs(body.previousBalancePrice);
    //                 client.deposit = client.deposit - Math.abs(balanceValue) < 0 ? 0 : client.deposit - Math.abs(balanceValue);
    //             } else if (Math.abs(body.previousBalancePrice) > Math.abs(body.balance)) {
    //                 balanceValue = body.previousBalancePrice;
    //                 client.deposit = client.deposit - Math.abs(balanceValue) < 0 ? 0 : client.deposit - Math.abs(balanceValue);
    //             } else {
    //                 client.deposit = client.deposit - body.balance < 0 ? 0 : client.deposit - body.balance;
    //             }
    //         } else {
    //             client.deposit = client.deposit - Math.abs(body.previousBalancePrice) > 0 ? client.deposit - Math.abs(body.previousBalancePrice) : 0;
    //         }
    //         client = await this.clientsRepository.save(client);
    //     }
    //     return client;
    // }

    async updateBalanceFromDeletedVisits(visits: any) {
        for (let i = 0; i < visits.length; i++) {
            if (visits[i].balance > 0) {
                await this.clientsRepository.update(visits[i].clients.id, {
                    balance: visits[i].clients.balance - Math.abs(visits[i].balance)
                })
            }
        }
    }
}
