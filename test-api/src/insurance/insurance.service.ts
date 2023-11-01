import { ConflictException, HttpException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Insurance } from './schemas/insurance.entity';



@Injectable()
export class InsuranceService {
    constructor(
        @InjectRepository(Insurance)
        private readonly insuranceRepository: Repository<Insurance>
    ) {}

    // async insertIfEmpty() {
    //     return await this.insuranceRepository.insert({
    //         name: process.env.CompanyName,
    //         percentage: 0
    //     });
    // }

    // async checkIfEmpty() {
    //     return await this.insuranceRepository.count();
    // }

    async insertInsurance(body) {
        const newInsurance = this.insuranceRepository.create({
            name: body.name,
            percentage: body.percentage
        });
        try {
            return await this.insuranceRepository.save(newInsurance);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getInsurances(filter: any, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `insurance.${orderBy}`;
        const [list, count] = await this.insuranceRepository
            .createQueryBuilder('insurance')
            .skip(skipNumber)
            .take(maxNumber)
            .where(qb => {
                qb.where('insurance.name != :name', { name: process.env.CompanyName });
                if (parsedFilter.hasOwnProperty('id')) {
                    qb.where(`insurance.id = :id`, { id: parsedFilter['id'] })
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyInsurance(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.insuranceRepository.find({
            where: {
                id: In(filterData.ids),
                name: Not(process.env.CompanyName)
            },
            relations: ['priceLists']
        });
        return {
            data
        };
    }

    async getInsurance(insuranceId: string) {
        const insurance = await this.findInsurance(insuranceId);
        return insurance
    }

    async updateInsurance(id, body): Promise<any> {
        const newData = body;
        return await this.insuranceRepository.save(newData);
    }

    async deleteInsurance(insuranceId: string) {
        try {
            return await this.insuranceRepository.delete(insuranceId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteInsurances(insuranceIds): Promise<any> {
        const { ids } = insuranceIds;
        try {
            const result = await this.insuranceRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findInsurance(id: string): Promise<Insurance> {
        let insurance;
        try {
            insurance = await this.insuranceRepository.findOne(
                id);
            return insurance;
        } catch (error) {
            throw new NotFoundException('Could not find insurance.');
        }
    }
}
