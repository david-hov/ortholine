import {
    Controller,
    Get,
    Query,
    Logger,
    UseGuards,
    Req,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getUserIdFromToken } from '../utils/utils';

@Controller('notifications')
export class NotificationsController {
    private readonly logger = new Logger('NotificationsController');
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }


    @UseGuards(JwtAuthGuard)
    @Get('notFinished')
    async getAllClientsNotFinished(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/clients/ - get all not finished clients`, 'debug');
        const clients = await this.notificationsService.getNotFinishedClientss(filter, limit, page, orderBy, orderDir);
        return clients;
    }

    @UseGuards(JwtAuthGuard)
    @Get('callClientsLabs')
    async getCallClientsLabs(
    ) {
        this.logger.debug(`GET/visits/ - get all visits with clients and labs calls issue`, 'debug');
        const visits = await this.notificationsService.getCallClientsLabs();
        return visits;
    }

    @UseGuards(JwtAuthGuard)
    @Get('priceIssues')
    async getPriceIssues(
    ) {
        this.logger.debug(`GET/visits/ - get all visits with price issue`, 'debug');
        const visits = await this.notificationsService.getPriceIssues();
        return visits;
    }

    @UseGuards(JwtAuthGuard)
    @Get('notFinishedVisits')
    async getAllClientsnotFinishedVisits(
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
        @Req() req: any
    ) {
        this.logger.debug(`GET/clients/ - get all not finished clients`, 'debug');
        const userId = getUserIdFromToken(req.headers.authorization);
        const clients = await this.notificationsService.getAllClientsnotFinishedVisits(limit, page, userId);
        return clients;
    }

    @UseGuards(JwtAuthGuard)
    @Get('clientsReminder')
    async getAllClientsReminders(
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/clients/ - get all not finished clients`, 'debug');
        const clients = await this.notificationsService.getAllClientsReminders(limit, page, orderBy, orderDir);
        return clients;
    }
}
