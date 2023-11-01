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

import { InsuranceService } from './insurance.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('insurance')
export class InsuranceController {
    private readonly logger = new Logger('InsuranceController');
    constructor(
        private readonly insuranceService: InsuranceService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addInsurance(
        @Res() res,
        @Body() InsuranceBody: any,
    ) {
        this.logger.debug(`POST/insurance/ - add insurance`, 'debug');
        const data = await this.insuranceService.insertInsurance(InsuranceBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Insurance has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async getAllInsurance(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/insurance/ - get all insurance`, 'debug');
        // const empty = await this.insuranceService.checkIfEmpty()
        // if (empty == 0) {
        //     await this.insuranceService.insertIfEmpty();
        // }
        if (JSON.parse(filter).ids) {
            const insurance = await this.insuranceService.getManyInsurance(filter);
            return insurance
        }
        const insurance = await this.insuranceService.getInsurances(filter, limit, page, orderBy, orderDir);
        return insurance;
    }

    @Get(':id')
    getInsurance(
        @Param('id') insuranceId: string,
    ) {
        this.logger.debug(`GET/insurance/:id - get Insurance`, 'debug');
        return this.insuranceService.getInsurance(insuranceId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateInsurance(
        @Res() res,
        @Param('id') id: string,
        @Body() InsuranceBody: any,
    ) {
        this.logger.debug(`PUT/insurance/:id - update insurance`, 'debug');
        const updated = await this.insuranceService.updateInsurance(id, InsuranceBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Insurance has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeInsurance(@Res() res, @Param('id') insuranceId: string) {
        this.logger.debug(`DELETE/insurance/:id - delete Insurance`, 'debug');
        const insuranceDelete = await this.insuranceService.deleteInsurance(insuranceId);
        if (!insuranceDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Insurance has been successfully deleted',
            insuranceDelete,
        });
    }

    @Delete()
    async removeInsurances(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/insurance/ - delete insurance`, 'debug');
        const deletedInsurance = await this.insuranceService.deleteInsurances(ids);
        if (!deletedInsurance) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Insurance has been successfully deleted',
            deletedInsurance,
        });
    }
}
