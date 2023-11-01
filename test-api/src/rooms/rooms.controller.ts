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

import { RoomsService } from './rooms.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('rooms')
export class RoomsController {
    private readonly logger = new Logger('RoomsController');
    constructor(
        private readonly roomsService: RoomsService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addRooms(
        @Res() res,
        @Body() RoomsBody: any,
    ) {
        this.logger.debug(`POST/rooms/ - add rooms`, 'debug');
        const data = await this.roomsService.insertRooms(RoomsBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Rooms has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async getAllRooms(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/rooms/ - get all rooms`, 'debug');
        if (JSON.parse(filter).ids) {
            const rooms = await this.roomsService.getManyRooms(filter);
            return rooms
        }
        const rooms = await this.roomsService.getRoomss(filter, limit, page, orderBy, orderDir);
        return rooms;
    }

    @Get(':id')
    getRooms(
        @Param('id') roomsId: string,
    ) {
        this.logger.debug(`GET/rooms/:id - get Rooms`, 'debug');
        return this.roomsService.getRooms(roomsId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateRooms(
        @Res() res,
        @Param('id') id: string,
        @Body() RoomsBody: any,
    ) {
        this.logger.debug(`PUT/rooms/:id - update rooms`, 'debug');
        const updated = await this.roomsService.updateRooms(id, RoomsBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rooms has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeRooms(@Res() res, @Param('id') roomsId: string) {
        this.logger.debug(`DELETE/rooms/:id - delete Rooms`, 'debug');
        const roomsDelete = await this.roomsService.deleteRooms(roomsId);
        if (!roomsDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rooms has been successfully deleted',
            roomsDelete,
        });
    }

    @Delete()
    async removeRoomss(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/rooms/ - delete rooms`, 'debug');
        const deletedRooms = await this.roomsService.deleteRoomss(ids);
        if (!deletedRooms) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Rooms has been successfully deleted',
            deletedRooms,
        });
    }
}
