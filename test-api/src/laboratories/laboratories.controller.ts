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

import { LaboratoriesService } from './laboratories.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('laboratories')
export class LaboratoriesController {
    private readonly logger = new Logger('LaboratoriesController');
    constructor(
        private readonly laboratoriesService: LaboratoriesService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async Addlaboratories(
        @Res() res,
        @Body() LaboratoriesBody: any,
    ) {
        this.logger.debug(`POST/laboratories/ - add laboratories`, 'debug');
        const data = await this.laboratoriesService.insertLaboratories(LaboratoriesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Laboratories has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async GetAlllaboratories(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/laboratories/ - get all laboratories`, 'debug');
        if (JSON.parse(filter).ids) {
            const laboratories = await this.laboratoriesService.getManyLaboratories(filter);
            return laboratories
        }
        const laboratories = await this.laboratoriesService.getLaboratoriess(filter, limit, page, orderBy, orderDir);
        return laboratories;
    }

    @Get(':id')
    Getlaboratories(
        @Param('id') laboratoriesId: string,
    ) {
        this.logger.debug(`GET/laboratories/:id - get Laboratories`, 'debug');
        return this.laboratoriesService.getLaboratories(laboratoriesId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async Updatelaboratories(
        @Res() res,
        @Param('id') id: string,
        @Body() LaboratoriesBody: any,
    ) {
        this.logger.debug(`PUT/laboratories/:id - update laboratories`, 'debug');
        const updated = await this.laboratoriesService.updateLaboratories(id, LaboratoriesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Laboratories has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async Removelaboratories(@Res() res, @Param('id') laboratoriesId: string) {
        this.logger.debug(`DELETE/laboratories/:id - delete Laboratories`, 'debug');
        const laboratoriesDelete = await this.laboratoriesService.deleteLaboratories(laboratoriesId);
        if (!laboratoriesDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Laboratories has been successfully deleted',
            laboratoriesDelete,
        });
    }

    @Delete()
    async Removelaboratoriess(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/laboratories/ - delete laboratories`, 'debug');
        const deletedlaboratories = await this.laboratoriesService.deleteLaboratoriess(ids);
        if (!deletedlaboratories) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Laboratories has been successfully deleted',
            deletedlaboratories,
        });
    }
}
