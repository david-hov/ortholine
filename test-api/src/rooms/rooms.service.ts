import { ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Rooms } from './schemas/rooms.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Rooms)
        private readonly roomsRepository: Repository<Rooms>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>
    ) {}

    async insertRooms(body) {
        if (body.doctors) {
            body.doctors = await this.doctorsRepository.findByIds(body.doctors);
        }
        const newRooms = this.roomsRepository.create({
            name: body.name,
            doctors: body.doctors
        });
        try {
            return await this.roomsRepository.save(newRooms);
        } catch (error) {
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async getRoomss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = orderBy !== 'doctors'
            ? `rooms.${orderBy}` : `${orderBy}.id`;
        const [list, count] = await this.roomsRepository
            .createQueryBuilder('rooms')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'rooms.doctors',
                'doctors'
            )
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    async getManyRooms(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.roomsRepository.find({
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async getRooms(roomsId: string) {
        const rooms = await this.findRooms(roomsId);
        return rooms
    }

    async updateRooms(id, body): Promise<any> {
        const newData = body;
        if (newData.doctors) {
            newData.doctors = await this.doctorsRepository.findByIds(newData.doctors);
        }
        return await this.roomsRepository.save(newData);
    }

    async deleteRooms(roomsId: string) {
        try {
            return await this.roomsRepository.delete(roomsId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteRoomss(roomsIds): Promise<any> {
        const { ids } = roomsIds;
        try {
            const result = await this.roomsRepository.delete(ids);
            return result
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findRooms(id: string): Promise<Rooms> {
        let rooms;
        try {
            rooms = await this.roomsRepository.findOne(
                id, {
                relations: ['doctors'],
                loadRelationIds: true,
            });
            return rooms;
        } catch (error) {
            throw new NotFoundException('Could not find rooms.');
        }
    }
}
