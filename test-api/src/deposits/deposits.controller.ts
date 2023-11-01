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
} from '@nestjs/common';

import { DepositsService } from './deposits.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('deposits')
export class DepositsController {
    private readonly logger = new Logger('DepositsController');
    constructor(
        private readonly depositsService: DepositsService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addDeposits(
        @Res() res,
        @Body() DepositsBody: any,
    ) {
        this.logger.debug(`POST/deposits/ - add deposits`, 'debug');
        const data = await this.depositsService.insertDeposits(DepositsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Deposits has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async getAllDeposits(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/deposits/ - get all deposits`, 'debug');
        if (JSON.parse(filter).ids) {
            const deposits = await this.depositsService.getManyDeposits(filter);
            return deposits
        }
        const deposits = await this.depositsService.getDepositss(filter, limit, page, orderBy, orderDir);
        return deposits;
    }

    @Get(':id')
    getDeposits(
        @Param('id') depositsId: string,
    ) {
        this.logger.debug(`GET/deposits/:id - get Deposits`, 'debug');
        return this.depositsService.getDeposits(depositsId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateDeposits(
        @Res() res,
        @Param('id') id: string,
        @Body() DepositsBody: any,
    ) {
        this.logger.debug(`PUT/deposits/:id - update deposits`, 'debug');
        const updated = await this.depositsService.updateDeposits(id, DepositsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Deposits has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeDeposits(@Res() res, @Param('id') depositsId: string) {
        this.logger.debug(`DELETE/deposits/:id - delete Deposits`, 'debug');
        const depositsDelete = await this.depositsService.deleteDeposits(depositsId);
        if (!depositsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Deposits has been successfully deleted',
            depositsDelete,
        });
    }

    @Delete()
    async removeDepositss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/deposits/ - delete deposits`, 'debug');
        const deletedDeposits = await this.depositsService.deleteDepositss(ids);
        if (!deletedDeposits) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Deposits has been successfully deleted',
            deletedDeposits,
        });
    }
}
