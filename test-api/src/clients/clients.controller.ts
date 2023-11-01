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

import { ClientsService } from './clients.service';
import { TrimPipe } from '../utils/Trimer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RoleGuard } from '../auth/guards/roles.guard';

@Controller('clients')
export class ClientsController {
    private readonly logger = new Logger('ClientsController');
    constructor(
        private readonly clientsService: ClientsService,
    ) { }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Post()
    async addClients(
        @Res() res,
        @Body() ClientsBody: any,
    ) {
        this.logger.debug(`POST/clients/ - add clients`, 'debug');
        const data = await this.clientsService.insertClients(ClientsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Clients has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get()
    async getAllClients(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/clients/ - get all clients`, 'debug');
        if (JSON.parse(filter).ids) {
            const clients = await this.clientsService.getManyClients(filter);
            return clients
        }
        const clients = await this.clientsService.getClientss(filter, limit, page, orderBy, orderDir);
        return clients;
    }

    @UseGuards(JwtAuthGuard)
    @Get('clientTemplate/:id')
    async getclientTemplate(
        @Param('id') clientsId: string,
    ) {
        this.logger.debug(`GET/clients/:id - get Clients`, 'debug');
        return await this.clientsService.getClientsTemplate(clientsId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('fee/:id')
    async getClientsFee(
        @Param('id') clientsId: string,
    ) {
        this.logger.debug(`GET/clients/:id - get Clients`, 'debug');
        return await this.clientsService.getClientsFee(clientsId);
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Get(':id')
    async getClients(
        @Param('id') clientsId: string,
    ) {
        this.logger.debug(`GET/clients/:id - get Clients`, 'debug');
        return await this.clientsService.getClients(clientsId);
    }

    @Roles('super')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Put('restart/:id')
    async restartClientsDeposit(
        @Res() res,
        @Param('id') clientsId: string,
    ) {
        this.logger.debug(`PUT/clients/restart/:id - update/restart clients`, 'debug');
        const updated = await this.clientsService.restartClientsDeposit(clientsId);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Clients has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration', 'doctor')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateClients(
        @Res() res,
        @Param('id') id: string,
        @Body() ClientsBody: any,
    ) {
        this.logger.debug(`PUT/clients/:id - update clients`, 'debug');
        const updated = await this.clientsService.updateClients(id, ClientsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Clients has been successfully updated',
            updated,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete(':id')
    async removeClients(@Res() res, @Param('id') clientsId: string) {
        this.logger.debug(`DELETE/clients/:id - delete Clients`, 'debug');
        const clientsDelete = await this.clientsService.deleteClients(clientsId);
        if (!clientsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Clients has been successfully deleted',
            clientsDelete,
        });
    }

    @Roles('super', 'administration')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Delete()
    async removeClientss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/clients/ - delete clients`, 'debug');
        const deletedClients = await this.clientsService.deleteClientss(ids);
        if (!deletedClients) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Clients has been successfully deleted',
            deletedClients,
        });
    }
}
