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
} from '@nestjs/common';

import { SalariesService } from './salaries.service';
import { TrimPipe } from '../utils/Trimer';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('salaries')
export class SalariesController {
    private readonly logger = new Logger('SalariesController');
    constructor(
        private readonly salariesService: SalariesService,
    ) { }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Post()
    async addSalaries(
        @Res() res,
        @Body() SalariesBody: any,
    ) {
        this.logger.debug(`POST/Salaries/ - add Salaries`, 'debug');
        const data = await this.salariesService.insertSalaries(SalariesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Salaries has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get()
    async getAllSalaries(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/salaries/ - get all Salaries`, 'debug');
        if (JSON.parse(filter).ids) {
            const Salaries = await this.salariesService.getManySalaries(filter);
            return Salaries
        }
        const Salaries = await this.salariesService.getSalariess(filter, limit, page, orderBy, orderDir);
        return Salaries;
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get(':id')
    async getSalaries(
        @Param('id') visitsId: string,
    ) {
        this.logger.debug(`GET/Salaries/:id - get Salaries`, 'debug');
        return await this.salariesService.getSalaries(visitsId);
    }

    @Roles('super')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateSalaries(
        @Res() res,
        @Param('id') id: string,
        @Body() SalariesBody: any,
    ) {
        this.logger.debug(`PUT/Salaries/:id - update Salaries`, 'debug');
        const updated = await this.salariesService.updateSalaries(id, SalariesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Salaries has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete(':id')
    async removeSalaries(@Res() res, @Param('id') visitsId: string) {
        this.logger.debug(`DELETE/Salaries/:id - delete Salaries`, 'debug');
        const visitsDelete = await this.salariesService.deleteSalaries(visitsId);
        if (!visitsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Salaries has been successfully deleted',
            visitsDelete,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async removeSalariess(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/Salaries/ - delete Salaries`, 'debug');
        const deletedSalaries = await this.salariesService.deleteSalariess(ids);
        if (!deletedSalaries) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Salaries has been successfully deleted',
            deletedSalaries,
        });
    }
}
