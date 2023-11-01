import { Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Roles } from '../auth/schemas/roles.entity';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
    ) { }

    async insertRole(body) {
        const result = await this.rolesRepository.save(body);
        return result;
    }

    async getRoles(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData =
            `roles.${orderBy}`
        const [list, count] = await this.rolesRepository
            .createQueryBuilder('roles')
            .skip(skipNumber)
            .take(maxNumber)
            .where(qb => {
                qb.where('roles.name != :superName', { superName: 'super' });
                if (parsedFilter.hasOwnProperty('name')) {
                    if (parsedFilter.name != null) {
                        qb.andWhere('roles.name = :name', { name: parsedFilter.name });
                    } else {
                        qb.andWhere('roles.name != :name', { name: 'doctor' });
                    }
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count,
        };
    }

    async getManyRoles(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.rolesRepository.find({
            loadRelationIds: true,
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async updateRole(id, body): Promise<any> {
        return await this.rolesRepository.save(
            body,
        );
    }

    async deleteRole(roleId: string) {
        return await this.rolesRepository.delete(roleId);
    }

    async deleteRoles(roleIds): Promise<any> {
        return await this.rolesRepository.delete(roleIds);
    }

    async findRole(id: string) {
        let roles;
        try {
            roles = await this.rolesRepository.findOne(id);
        } catch (error) {
            throw new NotFoundException('Could not find role.');
        }
        if (!roles) {
            throw new NotFoundException('Could not find role.');
        }
        return {
            roles,
        };
    }
}
