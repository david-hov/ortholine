import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Laboratories } from './schemas/laboratories.entity';



@Injectable()
export class LaboratoriesService {
    constructor(
        @InjectRepository(Laboratories)
        private readonly laboratoriesRepository: Repository<Laboratories>
    ) {}

    async insertLaboratories(body) {
        const newlaboratories = this.laboratoriesRepository.create({
            name: body.name,
        });
        try {
            return await this.laboratoriesRepository.save(newlaboratories);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getLaboratoriess(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `laboratories.${orderBy}`;
        const [list, count] = await this.laboratoriesRepository
            .createQueryBuilder('laboratories')
            .skip(skipNumber)
            .take(maxNumber)
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyLaboratories(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.laboratoriesRepository.find({
            where: { id: In(filterData.ids) },
        });
        return {
            data
        };
    }

    async getLaboratories(laboratoriesId: string) {
        const laboratories = await this.findLaboratories(laboratoriesId);
        return laboratories
    }

    async updateLaboratories(id, body): Promise<any> {
        const newData = body;
        return await this.laboratoriesRepository.save(newData);
    }

    async deleteLaboratories(laboratoriesId: string) {
        try {
            return await this.laboratoriesRepository.delete(laboratoriesId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteLaboratoriess(laboratoriesIds): Promise<any> {
        const { ids } = laboratoriesIds;
        try {
            const result = await this.laboratoriesRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findLaboratories(id: string): Promise<Laboratories> {
        let laboratories;
        try {
            laboratories = await this.laboratoriesRepository.findOne(
                id);
            return laboratories;
        } catch (error) {
            throw new NotFoundException('Could not find laboratories.');
        }
    }
}
