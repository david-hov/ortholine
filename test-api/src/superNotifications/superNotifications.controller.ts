import {
    Controller,
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

import { SuperNotificationsService } from './superNotifications.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('superNotifications')
export class SuperNotificationsController {
    private readonly logger = new Logger('SuperNotificationsController');
    constructor(
        private readonly superNotificationsService: SuperNotificationsService,
    ) { }

    @Get()
    async getAllSuperNotifications(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/superNotifications/ - get all superNotifications`, 'debug');
        if (JSON.parse(filter).ids) {
            const superNotifications = await this.superNotificationsService.getManySuperNotifications(filter);
            return superNotifications
        }
        const superNotifications = await this.superNotificationsService.getSuperNotificationss(filter, limit, page, orderBy, orderDir);
        return superNotifications;
    }

    @Get(':id')
    getSuperNotifications(
        @Param('id') superNotificationsId: string,
    ) {
        this.logger.debug(`GET/superNotifications/:id - get SuperNotifications`, 'debug');
        return this.superNotificationsService.getSuperNotifications(superNotificationsId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateSuperNotifications(
        @Res() res,
        @Param('id') id: string,
        @Body() SuperNotificationsBody: any,
    ) {
        this.logger.debug(`PUT/superNotifications/:id - update superNotifications`, 'debug');
        const updated = await this.superNotificationsService.updateSuperNotifications(id, SuperNotificationsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'SuperNotifications has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeSuperNotifications(@Res() res, @Param('id') superNotificationsId: string) {
        this.logger.debug(`DELETE/superNotifications/:id - delete SuperNotifications`, 'debug');
        const superNotificationsDelete = await this.superNotificationsService.deleteSuperNotifications(superNotificationsId);
        if (!superNotificationsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'SuperNotifications has been successfully deleted',
            superNotificationsDelete,
        });
    }

    @Delete()
    async removeSuperNotificationss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/superNotifications/ - delete superNotifications`, 'debug');
        const deletedSuperNotifications = await this.superNotificationsService.deleteSuperNotificationss(ids);
        if (!deletedSuperNotifications) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'SuperNotifications has been successfully deleted',
            deletedSuperNotifications,
        });
    }
}
