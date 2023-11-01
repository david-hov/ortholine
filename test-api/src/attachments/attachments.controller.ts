import {
    Controller,
    Get,
    Query,
    Logger,
    Req,
    Delete,
    Res,
    Param,
    NotFoundException,
    Put,
    Body,
    Post,
} from '@nestjs/common';

import { AttachmentsService } from './attachments.service';

@Controller('attachments')
export class AttachmentsController {
    private readonly logger = new Logger('AttachmentsController');
    constructor(
        private attachmentsService: AttachmentsService,
    ) { }

    @Get(':id')
    getClients(
        @Param('id') attachmentId: string,
    ) {
        this.logger.debug(`GET/attachments/:id - get attachment`, 'debug');
        return this.attachmentsService.getAttachment(attachmentId);
    }

    @Get()
    async getAllAttachments(
        @Req() req,
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/attachments/ - get all attachments`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.ids && filteredData.ids.length !== 0) {
            return await this.attachmentsService.getManyAttachments(filter);
        }
        const attachments = await this.attachmentsService.getAttachments(filter, limit, page, orderBy, orderDir);
        return attachments;
    }

    @Get()
    async getAllVideos(
        @Req() req,
        @Query('filter') filter: string,
    ) {
        this.logger.debug(`GET/attachments/ - get all attachments`, 'debug');
        const filteredData = JSON.parse(filter);
        if (filteredData.ids.length !== 0) {
            return await this.attachmentsService.getManyAttachments(filter);
        }
    }

    // @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeAttachment(@Res() res, @Param('id') attachmentId: string) {
        this.logger.debug(`DELETE/attachment/:id - delete attachment`, 'debug');
        const attachmentDelete = await this.attachmentsService.deleteAttachment(attachmentId);
        if (!attachmentDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Payrolls has been successfully deleted',
            attachmentDelete,
        });
    }

    @Delete()
    // @UseGuards(JwtAuthGuard)
    async removeAttachments(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/attachment/ - delete attachments`, 'debug');
        const deletedAttachments = await this.attachmentsService.deleteAttachments(ids);
        if (!deletedAttachments) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            deletedAttachments,
        });
    }
}
