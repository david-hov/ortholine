import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PriceLists } from './schemas/priceLists.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';
import { Treatments } from '../visits/schemas/treatments.entity';

@Injectable()
export class PriceListsService {
    constructor(
        @InjectRepository(PriceLists)
        private readonly priceListsRepository: Repository<PriceLists>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(Insurance)
        private readonly insuranceRepository: Repository<Insurance>
    ) {}

    async insertPriceLists(body) {
        if (body.treatments) {
            body.treatments = await this.treatmentsRepository.findByIds(body.treatments);
        }
        if (body.insurance) {
            body.insurance = await this.insuranceRepository.findOne(body.insurance);
        }
        const newPriceLists = this.priceListsRepository.create({
            name: body.name,
            price: body.price,
            insurance: body.insurance
        });
        try {
            return await this.priceListsRepository.save(newPriceLists);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getPriceListss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `priceLists.${orderBy}`;
        const [list, count] = await this.priceListsRepository
            .createQueryBuilder('priceLists')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'priceLists.insurance',
                'insurance'
            )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('insurance')) {
                    if (parsedFilter.insurance !== null) {
                        qb.where('insurance.id = :id', { id: parsedFilter.insurance })
                        if (parsedFilter.hasOwnProperty('q')) {
                            qb.andWhere(`priceLists.name ILIKE :name`, { name: `%${parsedFilter.q.trim()}%` })
                        }
                    } else {
                        qb.where('insurance.id IS NULL')
                        if (parsedFilter.hasOwnProperty('q')) {
                            qb.andWhere(`priceLists.name ILIKE :name`, { name: `%${parsedFilter.q.trim()}%` })
                        }
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

    async getManyPriceLists(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.priceListsRepository.find({
            where: { id: In(filterData.ids) },
        });
        return {
            data
        };
    }

    async getPriceLists(priceListsId: string) {
        const priceLists = await this.findPriceLists(priceListsId);
        return priceLists
    }

    async updatePriceLists(id, body): Promise<any> {
        const newData = body;
        if (newData.treatments) {
            newData.treatments = await this.treatmentsRepository.findByIds(newData.treatments);
        }
        return await this.priceListsRepository.save(newData);
    }

    async deletePriceLists(priceListsId: string) {
        try {
            return await this.priceListsRepository.delete(priceListsId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deletePriceListss(priceListsIds): Promise<any> {
        const { ids } = priceListsIds;
        try {
            const result = await this.priceListsRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findPriceLists(id: string): Promise<PriceLists> {
        let priceLists;
        try {
            priceLists = await this.priceListsRepository.findOne(
                id, {
                relations: ['insurance'],
                loadRelationIds: true
            });
            return priceLists;
        } catch (error) {
            throw new NotFoundException('Could not find priceLists.');
        }
    }
}
