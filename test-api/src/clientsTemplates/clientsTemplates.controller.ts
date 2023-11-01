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

import { ClientsTemplatesService } from './clientsTemplates.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('clientsTemplates')
export class ClientsTemplatesController {
    private readonly logger = new Logger('ClientsTemplatesController');
    constructor(
        private readonly clientsTemplatesService: ClientsTemplatesService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addClientsTemplates(
        @Res() res,
        @Body() ClientsTemplatesBody: any,
    ) {
        this.logger.debug(`POST/clientsTemplates/ - add clientsTemplates`, 'debug');
        const data = await this.clientsTemplatesService.insertClientsTemplates(ClientsTemplatesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'ClientsTemplates has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async GetAllClientsTemplates(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/clientsTemplates/ - get all clientsTemplates`, 'debug');
        if (JSON.parse(filter).ids) {
            const clientsTemplates = await this.clientsTemplatesService.getManyClientsTemplates(filter);
            return clientsTemplates
        }
        const clientsTemplates = await this.clientsTemplatesService.getClientsTemplatess(filter, limit, page, orderBy, orderDir);
        return clientsTemplates;
    }

    @Get(':id')
    GetclientsTemplates(
        @Param('id') clientsTemplatesId: string,
    ) {
        this.logger.debug(`GET/clientsTemplates/:id - get ClientsTemplates`, 'debug');
        return this.clientsTemplatesService.getClientsTemplates(clientsTemplatesId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async UpdateclientsTemplates(
        @Res() res,
        @Param('id') id: string,
        @Body() ClientsTemplatesBody: any,
    ) {
        this.logger.debug(`PUT/clientsTemplates/:id - update clientsTemplates`, 'debug');
        const updated = await this.clientsTemplatesService.updateClientsTemplates(id, ClientsTemplatesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'ClientsTemplates has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeClientsTemplates(@Res() res, @Param('id') clientsTemplatesId: string) {
        this.logger.debug(`DELETE/clientsTemplates/:id - delete ClientsTemplates`, 'debug');
        const clientsTemplatesDelete = await this.clientsTemplatesService.deleteClientsTemplates(clientsTemplatesId);
        if (!clientsTemplatesDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'ClientsTemplates has been successfully deleted',
            clientsTemplatesDelete,
        });
    }

    @Delete()
    async removeclientsTemplatess(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/clientsTemplates/ - delete clientsTemplates`, 'debug');
        const CeletedclientsTemplates = await this.clientsTemplatesService.deleteClientsTemplatess(ids);
        if (!CeletedclientsTemplates) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'ClientsTemplates has been successfully deleted',
            CeletedclientsTemplates,
        });
    }
}
