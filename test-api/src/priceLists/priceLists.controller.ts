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

import { PriceListsService } from './priceLists.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('priceLists')
export class PriceListsController {
    private readonly logger = new Logger('PriceListsController');
    constructor(
        private readonly priceListsService: PriceListsService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addPriceLists(
        @Res() res,
        @Body() PriceListsBody: any,
    ) {
        this.logger.debug(`POST/priceLists/ - add priceLists`, 'debug');
        const data = await this.priceListsService.insertPriceLists(PriceListsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'PriceLists has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async getAllPriceLists(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/priceLists/ - get all priceLists`, 'debug');
        if (JSON.parse(filter).ids) {
            const priceLists = await this.priceListsService.getManyPriceLists(filter);
            return priceLists
        }
        const priceLists = await this.priceListsService.getPriceListss(filter, limit, page, orderBy, orderDir);
        return priceLists;
    }

    @Get(':id')
    getPriceLists(
        @Param('id') priceListsId: string,
    ) {
        this.logger.debug(`GET/priceLists/:id - get PriceLists`, 'debug');
        return this.priceListsService.getPriceLists(priceListsId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updatePriceLists(
        @Res() res,
        @Param('id') id: string,
        @Body() PriceListsBody: any,
    ) {
        this.logger.debug(`PUT/priceLists/:id - update priceLists`, 'debug');
        const updated = await this.priceListsService.updatePriceLists(id, PriceListsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'PriceLists has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removePriceLists(@Res() res, @Param('id') priceListsId: string) {
        this.logger.debug(`DELETE/priceLists/:id - delete PriceLists`, 'debug');
        const priceListsDelete = await this.priceListsService.deletePriceLists(priceListsId);
        if (!priceListsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'PriceLists has been successfully deleted',
            priceListsDelete,
        });
    }

    @Delete()
    async removePriceListss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/priceLists/ - delete priceLists`, 'debug');
        const deletedPriceLists = await this.priceListsService.deletePriceListss(ids);
        if (!deletedPriceLists) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'PriceLists has been successfully deleted',
            deletedPriceLists,
        });
    }
}
