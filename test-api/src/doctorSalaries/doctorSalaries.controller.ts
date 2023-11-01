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

import { DoctorSalariesService } from './doctorSalaries.service';
import { TrimPipe } from '../utils/Trimer';

@Controller('doctorSalaries')
export class DoctorSalariesController {
    private readonly logger = new Logger('DoctorSalariesController');
    constructor(
        private readonly doctorSalariesService: DoctorSalariesService,
    ) { }

    @UsePipes(new TrimPipe())
    @Post()
    async addDoctorSalaries(
        @Res() res,
        @Body() DoctorSalariesBody: any,
    ) {
        this.logger.debug(`POST/doctorSalaries/ - add doctorSalaries`, 'debug');
        const data = await this.doctorSalariesService.insertDoctorSalaries(DoctorSalariesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'DoctorSalaries has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @Get()
    async getAllDoctorSalaries(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/doctorSalaries/ - get all doctorSalaries`, 'debug');
        if (JSON.parse(filter).ids) {
            const doctorSalaries = await this.doctorSalariesService.getManyDoctorSalaries(filter);
            return doctorSalaries
        }
        const doctorSalaries = await this.doctorSalariesService.getDoctorSalariess(limit, page, orderBy, orderDir);
        return doctorSalaries;
    }

    @Get(':id')
    getDoctorSalaries(
        @Param('id') doctorSalariesId: string,
    ) {
        this.logger.debug(`GET/doctorSalaries/:id - get DoctorSalaries`, 'debug');
        return this.doctorSalariesService.getDoctorSalaries(doctorSalariesId);
    }

    @UsePipes(new TrimPipe())
    @Put(':id')
    async updateDoctorSalaries(
        @Res() res,
        @Param('id') id: string,
        @Body() DoctorSalariesBody: any,
    ) {
        this.logger.debug(`PUT/doctorSalaries/:id - update doctorSalaries`, 'debug');
        const updated = await this.doctorSalariesService.updateDoctorSalaries(id, DoctorSalariesBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'DoctorSalaries has been successfully updated',
            updated,
        });
    }

    @Delete(':id')
    async removeDoctorSalaries(@Res() res, @Param('id') doctorSalariesId: string) {
        this.logger.debug(`DELETE/doctorSalaries/:id - delete DoctorSalaries`, 'debug');
        const doctorSalariesDelete = await this.doctorSalariesService.deleteDoctorSalaries(doctorSalariesId);
        if (!doctorSalariesDelete) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'DoctorSalaries has been successfully deleted',
            doctorSalariesDelete,
        });
    }

    @Delete()
    async removeDoctorSalariess(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/doctorSalaries/ - delete doctorSalaries`, 'debug');
        const deletedDoctorSalaries = await this.doctorSalariesService.deleteDoctorSalariess(ids);
        if (!deletedDoctorSalaries) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'DoctorSalaries has been successfully deleted',
            deletedDoctorSalaries,
        });
    }
}
