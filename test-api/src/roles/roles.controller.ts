import {
    Body,
    Controller,
    Post,
    UseGuards,
    Res,
    Put,
    Param,
    NotFoundException,
    Logger,
    Get,
    Query,
    Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    private readonly logger = new Logger('RolesController');
    constructor(
        private readonly rolesService: RolesService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addRoles(
        @Res() res,
        @Body() RolesBody,
    ) {
        this.logger.debug(`POST/role/ - add role`, 'debug');
        const data = await this.rolesService.insertRole(RolesBody);
        if (!data) {
            throw new Error('Failed to create');
        }
        return res.status(200).json({
            response: {
                message: 'Role has been successfully created',
                data,
                id: data.id
            }
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllRoles(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        this.logger.debug(`GET/roles/ - get all roles`, 'debug');
        if (JSON.parse(filter).ids) {
            const kengurus = await this.rolesService.getManyRoles(filter);
            return kengurus
        }
        const roles = await this.rolesService.getRoles(filter, limit, page, orderBy, orderDir);
        return roles;
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateRole(
        @Res() res,
        @Param('id') id: string,
        @Body() RoleBody,
    ) {
        this.logger.debug(`PUT/role/:id - update role`, 'debug');
        const updated = await this.rolesService.updateRole(id, RoleBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Role has been successfully updated',
            updated,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getRole(
        @Param('id') roleId: string,
    ) {
        this.logger.debug(`GET/role/:id - get role`, 'debug');
        return this.rolesService.findRole(roleId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeRole(@Res() res, @Param('id') roleId: string) {
        this.logger.debug(`DELETE/kengurus/:id - delete Kengurus`, 'debug');
        if (roleId !== '1') {
            const rolesDelete = await this.rolesService.deleteRole(roleId);
            if (!rolesDelete) {
                throw new NotFoundException('Id does not exist!');
            }
            return res.status(200).json({
                message: 'Role has been successfully deleted',
                rolesDelete,
            });
        } else {
            return res.status(500).json({
                message: 'Can not delete',
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeRoles(@Res() res, @Body() ids) {
        this.logger.debug(`DELETE/roles/ - delete roles`, 'debug');
        const deletebleRoles = ids.ids.filter(item => item !== 1);
        const roles = await this.rolesService.deleteRoles(deletebleRoles);
        if (!roles) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Roles has been successfully deleted',
            roles,
        });
    }
}
