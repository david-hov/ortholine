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
    Req,
} from '@nestjs/common';

import { ReportsService } from './reports.service';
import { TrimPipe } from '../utils/Trimer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('reports')
export class ReportsController {
    private readonly logger = new Logger('ReportsController');
    constructor(
        private readonly reportsService: ReportsService,
    ) { }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('currentReports')
    async getCurrentReports(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/visits/:id - get reports Visits`, 'debug');
        return await this.reportsService.getCurrentReportsForDoctor(filter);
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('currentInuranceReports')
    async getCurrentReportsInsuranceForDoctor(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/visits/:id - get reports Visits`, 'debug');
        return await this.reportsService.getCurrentReportsInsuranceForDoctor(filter);
    }

    // @Roles('super', 'administration')
    // @UseGuards(JwtAuthGuard, RoleGuard)
    // @Get('periodReports')
    // async getReports(
    //     @Query('filter') filter: string,
    // ) {
    //     this.logger.debug(`GET/visits/:id - get reports Visits`, 'debug');
    //     return await this.reportsService.getPeriodReportsForDoctor(filter);
    // }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('currentReportsForSalary')
    async getCurrentReportsForSalary(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/Salaries/:id - get Salaries reports`, 'debug');
        return await this.reportsService.getCurrentReportsForSalary(filter);
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('currentInuranceReportsForSalary')
    async getCurrentReportsInsuranceForSalary(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/Salaries/:id - get Salaries reports`, 'debug');
        return await this.reportsService.getCurrentReportsInsuranceForSalary(filter);
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('labReports/:id')
    async getLabReports(
        @Param('id') doctorId: string,
    ) {
        this.logger.debug(`GET/doctors/ - get reports doctors`, 'debug');
        return await this.reportsService.getLabReports(doctorId);
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('labReportsForSalary/:id')
    async getLabReportsForSalary(
        @Param('id') salaryId: string,
    ) {
        this.logger.debug(`GET/doctors/ - get reports doctors`, 'debug');
        return await this.reportsService.getLabReportsForSalary(salaryId);
    }
}
