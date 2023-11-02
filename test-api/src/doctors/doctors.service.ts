import { ConflictException, HttpException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { Doctors } from './schemas/doctors.entity';
import { Visits } from '../visits/schemas/visits.entity';
import { Users } from '../auth/schemas/users.entity';
import { Salaries } from '../salaries/schemas/salaries.entity';
import { Treatments } from '../visits/schemas/treatments.entity';
import { Insurance } from '../insurance/schemas/insurance.entity';


import { Fee } from '../visits/schemas/fee.entity';
import { DoctorSalaries } from '../doctorSalaries/schemas/doctorSalaries.entity';
import { ClientsTemplates } from '../clientsTemplates/schemas/clientsTemplates.entity';

@Injectable()
export class DoctorsService {
    constructor(
        private connection: Connection,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Visits)
        private readonly visitsRepository: Repository<Visits>,
        @InjectRepository(Treatments)
        private readonly treatmentsRepository: Repository<Treatments>,
        @InjectRepository(Insurance)
        private readonly insuranceRepository: Repository<Insurance>,
        @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
        @InjectRepository(Fee)
        private readonly feeRepository: Repository<Fee>,
        @InjectRepository(Salaries)
        private readonly salariesRepository: Repository<Salaries>,
        @InjectRepository(DoctorSalaries)
        private readonly doctorSalariesRepository: Repository<DoctorSalaries>,
        @InjectRepository(ClientsTemplates)
        private readonly clientsTemplatesRepository: Repository<ClientsTemplates>,
    ) {}

    async insertDoctors(body) {
        if (body.visits) {
            body.visits = await this.visitsRepository.findOne(body.visits)
        }
        const newDoctors = this.doctorsRepository.create({
            name: body.name,
            visits: body.visits,
            percentage: body.percentage,
            sum: body.sum,
            color: body.color,
            shortName: body.shortName,
        });
        try {
            return await this.doctorsRepository.save(newDoctors);
        } catch (error) {
            console.log(error)
            if (error.code == 23505) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async checkIfAvaialble(filter: string) {
        const parsedFilter = JSON.parse(filter);
        const data = await this.doctorsRepository
            .createQueryBuilder('doctors')
            .where('doctors.id = :id', { id: parsedFilter.id })
            .andWhere(`doctors.startVacation <= :date`, { date: moment(parsedFilter.startDate).format("YYYY-MM-DD 00:00:ss") })
            .andWhere(`doctors.endVacation >= :dateEnd`, { dateEnd: moment(parsedFilter.startDate).format("YYYY-MM-DD 23:59:ss") })
            .getOne()
        return {
            data,
            count: 0
        };
    }

    async getDoctorss(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData = `doctors.${orderBy}`;
        const [list, count] = await this.doctorsRepository
            .createQueryBuilder('doctors')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect(
                'doctors.rooms',
                'rooms'
            )
            .leftJoinAndSelect(
                'doctors.visits',
                'visits'
            )
            .leftJoinAndSelect(
                'doctors.users',
                'users'
            )
            .where(qb => {
                if (parsedFilter.hasOwnProperty('notHaveUser')) {
                    qb.where('users IS NULL')
                }
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getManyAndCount();

        return {
            data: list,
            count: count
        };
    }

    // async getReports(doctorId: any) {
    //     const doctor: any = await this.doctorsRepository
    //         .createQueryBuilder('doctors')
    //         .where(qb => {
    //             qb.where('doctors.id = :id', { id: doctorId });
    //         })
    //         .getOne();
    //     if (doctor.laboratories.length !== 0) {
    //         for (let i = 0; i < doctor.laboratories.length; i++) {
    //             doctor.laboratories[i].laboratories = await (await this.laboratoriesRepository.findOne(doctor.laboratories[i].laboratories)).name;
    //         }
    //     }
    //     return doctor
    // }

    async getManyDoctors(filter: any) {
        const filterData = typeof filter === 'object' ? filter : JSON.parse(filter);
        const data = await this.doctorsRepository.find({
            where: { id: In(filterData.ids) }
        });
        return {
            data
        };
    }

    async getDoctors(doctorsId: string) {
        const doctors = await this.findDoctors(doctorsId);
        return doctors
    }


    async updateDoctors(id, body): Promise<any> {
        const newData = body;
        if (body.visits) {
            body.visits = await this.visitsRepository.findByIds(body.visits)
        }
        if (body.startVacation && body.endVacation) {
            body.startVacation = moment(body.startVacation).format("YYYY-MM-DD 00:00:ss")
            body.endVacation = moment(body.endVacation).format("YYYY-MM-DD 23:59:ss");
            body.vacation = true;
        } else {
            body.startVacation = null
            body.endVacation = null;
            body.vacation = false;
        }
        if (body.users) {
            body.users = await this.usersRepository.findByIds(body.users)
        }
        if (body.salaries) {
            body.salaries = await this.salariesRepository.findByIds(body.salaries)
        }
        return await this.doctorsRepository.save(newData);
    }

    async updateDoctorsSalary(id, body): Promise<any> {
        const doctor = await this.doctorsRepository.findOne(id);
        const clientsTemplates = await this.clientsTemplatesRepository.findOne(body.salary.clientsTemplates);
        const fee = await this.feeRepository.findOne(body.fee);
        if (body.salary.insurance == null) {
            const queryRunner = this.connection.createQueryRunner()
            await queryRunner.startTransaction();
            const isExistDoctorSalary = await this.doctorSalariesRepository.findOne({
                where: {
                    doctors: doctor,
                    special: body.salary.special,
                    insurance: null,
                    salaries: null,
                    salarySent: false,
                    clientsTemplates: body.salary.special ? clientsTemplates : null
                },
                relations: ['doctors']
            })
            if (fee) {
                fee.feeSentToDoctor = body.sentToDoctor;
            }
            try {
                await queryRunner.manager.save('fee', fee)
                if (isExistDoctorSalary) {
                    const incDecPrice = body.sentToDoctor ? isExistDoctorSalary.price + parseInt(body.salary.price) :
                        isExistDoctorSalary.price - parseInt(body.salary.price);
                    if (incDecPrice == 0) {
                        await queryRunner.manager.remove('doctorSalaries', isExistDoctorSalary)
                    } else {
                        await queryRunner.manager.update('doctorSalaries', isExistDoctorSalary.id, {
                            special: body.salary.special,
                            price: incDecPrice,
                            specialPercentage: body.salary.specialPercentage,
                            insurance: body.salary.insurance,
                            doctors: doctor,
                            clientsTemplates: body.salary.special ? clientsTemplates : null
                        })
                    }
                } else {
                    await queryRunner.manager.insert('doctorSalaries', {
                        price: parseInt(body.salary.price),
                        special: body.salary.special ? true : false,
                        specialPercentage: body.salary.specialPercentage,
                        insurance: body.salary.insurance,
                        doctors: doctor,
                        clientsTemplates: body.salary.special ? clientsTemplates : null
                    })
                }
                await queryRunner.commitTransaction()
            } catch (err) {
                await queryRunner.rollbackTransaction()
                throw new HttpException('Something went wrong', 500)
            } finally {
                await queryRunner.release()
            }
        } else {
            const treatment = await this.treatmentsRepository.findOne(body.treatment);
            const isExistDoctorInsuranceSalary = await this.doctorSalariesRepository.findOne({
                where: {
                    doctors: doctor.id,
                    insurance: body.salary.insurance,
                    salaries: null
                },
                relations: ['insurance']
            })
            const insurance = await this.insuranceRepository.findOne(body.salary.insurance);
            if (isExistDoctorInsuranceSalary) {
                const incDecPrice = body.sentToDoctor ? isExistDoctorInsuranceSalary.price + parseInt(body.salary.price) :
                    isExistDoctorInsuranceSalary.price - parseInt(body.salary.price);
                if (isExistDoctorInsuranceSalary.insurance.id == insurance.id) {
                    await this.doctorSalariesRepository.update(isExistDoctorInsuranceSalary.id, {
                        price: incDecPrice,
                        insurance: insurance,
                        doctors: doctor,
                        clientsTemplates: null,
                    })
                } else {
                    await this.doctorSalariesRepository.insert({
                        price: parseInt(body.salary.price),
                        special: false,
                        specialPercentage: 0,
                        insurance: insurance,
                        doctors: doctor,
                        clientsTemplates: null,
                    })
                }
            } else {
                await this.doctorSalariesRepository.insert({
                    price: parseInt(body.salary.price),
                    special: false,
                    specialPercentage: 0,
                    insurance: insurance,
                    doctors: doctor,
                    clientsTemplates: null,
                })
            }
            if (treatment) {
                await this.treatmentsRepository.update(treatment.id, {
                    insuranceSalarySentToDoctor: body.sentToDoctor ? true : false
                });
            }
        }
        return await this.doctorsRepository.save(doctor)
    }

    async deleteDoctors(doctorsId: string) {
        try {
            return await this.doctorsRepository.delete(doctorsId);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    async deleteDoctorss(doctorsIds): Promise<any> {
        const { ids } = doctorsIds;
        try {
            return await this.doctorsRepository.delete(ids);
        } catch (error) {
            if (error.code == 23503) {
                throw new ConflictException(error.detail)
            } else {
                throw new HttpException('Something went wrong', 500)
            }
        }
    }

    private async findDoctors(id: string): Promise<Doctors> {
        let doctors;
        try {
            doctors = await this.doctorsRepository
                .createQueryBuilder('doctors')
                .loadAllRelationIds({
                    relations: ['visits']
                })
                .leftJoinAndSelect('doctors.clientsTemplates', 'doctorClientsTemplates')
                .leftJoinAndSelect('doctors.doctorSalaries', 'doctorSalaries', 'doctorSalaries.salarySent = :salarySent', { salarySent: false })
                .leftJoinAndSelect('doctorSalaries.insurance', 'insurance')
                .leftJoinAndSelect('doctorSalaries.clientsTemplates', 'clientsTemplates')
                .where('doctors.id = :id', { id: id })
                .getOne()
            return doctors;
        } catch (error) {
            throw new NotFoundException('Could not find doctors.');
        }
    }
}
