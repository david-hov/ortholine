import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    Query,
    Res,
    Put,
    NotFoundException,
    Logger,
    UsePipes,
    UseGuards,
    Inject,
} from '@nestjs/common';

import { DoctorsService } from './doctors.service';
import { TrimPipe } from '../utils/Trimer';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('doctors')
export class DoctorsController {
    private readonly logger = new Logger('DoctorsController');
    constructor(
        @Inject(DoctorsService)
        private readonly doctorsService: DoctorsService,
    ) { }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Post()
    async addDoctors(
        @Res() res,
        @Body() DoctorsBody: any,
    ) {
        this.logger.debug(`POST/Doctors/ - add Doctors`, 'debug');
        const data = await this.doctorsService.insertDoctors(DoctorsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Doctors has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get()
    async getAllDoctors(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/doctors/ - get all doctors`, 'debug');
        if (JSON.parse(filter).ids) {
            const Doctors = await this.doctorsService.getManyDoctors(filter);
            return Doctors
        }
        const Doctors = await this.doctorsService.getDoctorss(filter, limit, page, orderBy, orderDir);
        return Doctors;
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('available')
    async getReports(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/doctors/ - get reports doctors`, 'debug');
        return await this.doctorsService.checkIfAvaialble(filter);
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get(':id')
    getDoctors(
        @Param('id') visitsId: string,
    ) {
        this.logger.debug(`GET/Doctors/:id - get Doctors`, 'debug');
        return this.doctorsService.getDoctors(visitsId);
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateDoctors(
        @Res() res,
        @Param('id') id: string,
        @Body() DoctorsBody: any,
    ) {
        this.logger.debug(`PUT/Doctors/:id - update Doctors`, 'debug');
        const updated = await this.doctorsService.updateDoctors(id, DoctorsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Doctors has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Put('salary/:id')
    async updateDoctorsSalary(
        @Res() res,
        @Param('id') id: string,
        @Body() salaryBody: any,
    ) {
        this.logger.debug(`PUT/Doctors/:id - update Doctors salary`, 'debug');
        const updated = await this.doctorsService.updateDoctorsSalary(id, salaryBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Doctors has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete(':id')
    async removeDoctors(@Res() res, @Param('id') visitsId: string) {
        this.logger.debug(`DELETE/Doctors/:id - delete Doctors`, 'debug');
        const visitsDelete = await this.doctorsService.deleteDoctors(visitsId);
        if (!visitsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Doctors has been successfully deleted',
            visitsDelete,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async removeDoctorss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/Doctors/ - delete Doctors`, 'debug');
        const deletedDoctors = await this.doctorsService.deleteDoctorss(ids);
        if (!deletedDoctors) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Doctors has been successfully deleted',
            deletedDoctors,
        });
    }
}
