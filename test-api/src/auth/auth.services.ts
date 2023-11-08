import { NotFoundException, NotAcceptableException, UnauthorizedException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Users } from './schemas/users.entity';
import { Roles } from './schemas/roles.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Settings } from '../settings/schemas/settings.entity';
import { AppGateway } from '../app.gateway';

@Injectable()
export class AuthService {
    constructor(
        private gateway: AppGateway,
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
        @InjectRepository(Roles)
        private readonly rolesRepository: Repository<Roles>,
        @InjectRepository(Doctors)
        private readonly doctorsRepository: Repository<Doctors>,
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
        private jwtService: JwtService,
    ) {
        this.rolesRepository.count().then(async (res) => {
            if (res === 0) {
                await this.rolesRepository.insert([
                    {
                        'name': 'super',
                    },
                    {
                        'name': 'administration',
                    },
                    {
                        'name': 'doctor',
                    },
                ]).then((item) => {
                    this.userRepository.count().then(async (res) => {
                        if (res === 0) {
                            await this.signUp({
                                name: 'Super',
                                username: 'admin',
                                password: 'adminadmin',
                                roles: item.raw[0],
                                doctors: null,
                            });
                        }
                    }).then((el: any) => {
                        this.settingsRepository.insert({
                            xRayPrice: 1500,
                            printDetailsInfo: '<p></p>',
                            companyImage: null,
                            companyName: process.env.CompanyName,
                            companyDirector: 'Անուն Ազգանուն'
                        });
                    })
                });
            }
        });
    }

    async signIn(username, pass) {
        username = username.replace(/\s/g, '')
        pass = pass.replace(/\s/g, '')
        const user = await this.userRepository.findOne({ username }, {
            relations: ['roles'],
            loadRelationIds: true,
        });
        if (!user) {
            throw new UnauthorizedException();
        } else {
            const valid = await bcrypt.compare(pass, user.password);
            if (!valid) {
                throw new UnauthorizedException();
            }
        }
        const { name } = await this.rolesRepository
            .createQueryBuilder('roles')
            .where('roles.id = :id', { id: user.roles })
            .getOne();
        const payload = { username: user.username, sub: user.id, role: name };
        return {
            accessToken: this.jwtService.sign(payload),
            name: user.name
        };
    }

    async updateUser(id, body): Promise<any> {
        if (body.doctors) {
            body.doctors = await this.doctorsRepository.findOne(body.doctors);
        }
        if (body.hasOwnProperty('newPassword')) {
            body.password = await bcrypt.hash(body.newPassword, 10)
        }
        return await this.userRepository.save(body);
    }

    async signUp(authCredentialsDto: any): Promise<any> {
        let { username, password, name, roles, doctors } = authCredentialsDto;
        const checkUserExistence = await this.getUser(username);
        if (checkUserExistence) {
            throw new NotAcceptableException(
                'Another user with provided username already exists.',
            );
        }
        if (doctors) {
            doctors = await this.doctorsRepository.findOne(doctors);
        }
        if (roles) {
            roles = await this.rolesRepository.findOne(roles);
        }
        username = username.toLowerCase();
        password = password.toLowerCase();
        const hashedPassword = await bcrypt.hash(password, 10);
        return await this.userRepository.save({
            username,
            name,
            doctors: doctors,
            password: hashedPassword,
            roles
        });
    }

    async updateToken(body: any) {
        this.gateway.handleMessageGetToken(body)
        return 'Close this tab';
    }

    async validateUser(username: string, pass: string): Promise<Users> {
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            return null;
        }

        const valid = await bcrypt.compare(pass, user.password);
        if (valid) {
            return user;
        }

        return null;
    }

    async getImage(): Promise<any> {
        const data = await this.userRepository
            .createQueryBuilder('users')
            .where('users.avatar IS NOT NULL')
            .getOne();
        return data;
    }

    async getUsers(filter: string, limit: string, page: string, orderBy: string, orderDir: string) {
        const parsedFilter = JSON.parse(filter);
        const strictMode = parsedFilter.strictMode;
        delete parsedFilter.strictMode;
        const maxNumber = parseInt(limit);
        const skipNumber = (parseInt(page) - 1) * parseInt(limit);
        const sortData =

            `users.${orderBy}`

        const data = await this.userRepository
            .createQueryBuilder('users')
            .skip(skipNumber)
            .take(maxNumber)
            .loadAllRelationIds()
            .leftJoinAndSelect('users.roles', 'roles')
            .leftJoinAndSelect('users.doctors', 'doctors')
            .where(qb => {
                qb.where(parsedFilter);
            })
            .orderBy(sortData, orderDir === 'ASC' ? 'ASC' : 'DESC')
            .getMany();

        const count = await this.userRepository.count({});

        return {
            data,
            count: count,
            weeklyData: null
        };
    }

    async getUser(username: string) {
        const user = await this.userRepository.findOne({ username });
        return user;
    }

    async findRole(userId: string) {
        const userRole = await this.userRepository.findOne(userId, {
            relations: ['roles'],
        });
        return userRole.roles.name;
    }

    async deleteUser(userId: string) {
        return await this.userRepository.delete(userId);
    }

    async deleteUsers(userIds): Promise<any> {
        return await this.userRepository.delete(userIds);
    }

    async findUser(id: string) {
        let auth;
        try {
            auth = await this.userRepository.findOne(id,
                {
                    relations: ['roles', 'doctors'],
                    loadRelationIds: true
                }
            );
        } catch (error) {
            throw new NotFoundException('Could not find user.');
        }
        delete auth.password
        if (!auth) {
            throw new NotFoundException('Could not find user.');
        }
        return auth;
    }
}
