import {
    Controller,
    Get,
    Query,
    Logger,
} from '@nestjs/common';

import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    private readonly logger = new Logger('SalariesController');
    constructor(
        private readonly salariesService: StatisticsService,
    ) { }

    @Get('clients')
    async getClients(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/statistics/ - get all clients`, 'debug');
        const statistics = await this.salariesService.getClientsMainStatistics(filter);
        return statistics;
    }

    @Get('visits')
    async getVisits(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/statistics/ - get all visits`, 'debug');
        const statistics = await this.salariesService.getVisitsMainStatistics(filter);
        return statistics;
    }

    @Get('visits/insurance')
    async getVisitsBalance(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/statistics/ - get all clients`, 'debug');
        const statistics = await this.salariesService.getVisitsStatistics(filter);
        return statistics;
    }


    @Get('clients/balance')
    async getClientsBalance(
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/statistics/ - get all clients`, 'debug');
        const statistics = await this.salariesService.getClientsStatistics(filter);
        return statistics;
    }

}
