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

import { VisitsService } from './visits.service';
import { TrimPipe } from '../utils/Trimer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';
import { VisitsUtilsService } from './visitsUtils.service';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('visits')
export class VisitsController {
    private readonly logger = new Logger('VisitsController');
    constructor(
        private readonly visitsService: VisitsService,
        private readonly visitsUtilsService: VisitsUtilsService,
    ) { }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Post()
    async addVisits(
        @Res() res,
        @Body() VisitsBody: any,
    ) {
        this.logger.debug(`POST/visits/ - add visits`, 'debug');
        const data = await this.visitsService.insertVisits(VisitsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Visits has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get()
    async getAllVisits(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
        @Req() req: any
    ) {
        this.logger.debug(`GET/visits/ - get all visits`, 'debug');
        if (JSON.parse(filter).ids) {
            const visits = await this.visitsService.getManyVisits(filter);
            return visits
        }
        const userId = getUserIdFromToken(req.headers.authorization);
        const visits = await this.visitsService.getVisitss(filter, limit, page, orderBy, orderDir, userId);
        return visits;
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('calendar')
    async getAllVisitsCalendar(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Req() req: any
    ) {
        this.logger.debug(`GET/visits/ - get all visits`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        const visits = await this.visitsUtilsService.getCalendarVisitss(filter, limit, page, userId);
        return visits;
    }

    @Get('printStatistics')
    async printVisitsStatistics(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/visits/:id - get print statistics`, 'debug');
        return await this.visitsUtilsService.printVisitsStatistics(filter);
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get(':id')
    async getVisits(
        @Param('id') visitsId: string,
        @Req() req: any
    ) {
        this.logger.debug(`GET/visits/:id - get Visits`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        return await this.visitsService.getVisits(visitsId, userId);
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('balance/total')
    async getBalance(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/visits/:id - get total balance`, 'debug');
        return await this.visitsUtilsService.getTotal(filter);
    }


    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get('xRay/total')
    async getXrayCount(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/visits/xray - get total xray count`, 'debug');
        return await this.visitsUtilsService.getXrayCount(filter);
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateVisits(
        @Res() res,
        @Param('id') id: string,
        @Body() VisitsBody: any,
    ) {
        this.logger.debug(`PUT/visits/:id - update visits`, 'debug');
        const updated = await this.visitsService.updateVisits(id, VisitsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Visits has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Put('isArrived/:id')
    async updateIsArrivedVisits(
        @Res() res,
        @Param('id') id: string,
        @Body() VisitsBody: any,
    ) {
        this.logger.debug(`PUT/visits/:id - update visits`, 'debug');
        const updated = await this.visitsUtilsService.updateIsArrivedVisits(id, VisitsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Visits has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Put('movementCalendar/:id')
    async updateMoveVisits(
        @Res() res,
        @Param('id') id: string,
        @Body() VisitsBody: any,
    ) {
        this.logger.debug(`PUT/visits/:id - update movement visits`, 'debug');
        const updated = await this.visitsUtilsService.updateMovementVisists(id, VisitsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Visits has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete(':id')
    async removeVisits(@Res() res, @Param('id') visitsId: string) {
        this.logger.debug(`DELETE/visits/:id - delete Visits`, 'debug');
        const visitsDelete = await this.visitsService.deleteVisits(visitsId);
        if (!visitsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Visits has been successfully deleted',
            visitsDelete,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async removeVisitss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/visits/ - delete visits`, 'debug');
        const deletedVisits = await this.visitsService.deleteVisitss(ids);
        if (!deletedVisits) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Visits has been successfully deleted',
            deletedVisits,
        });
    }
}
