import {
    Body,
    Controller,
    Post,
    Request,
    UseGuards,
    ValidationPipe,
    Res,
    Put,
    Param,
    NotFoundException,
    Get,
    Query,
    Delete,
    Inject,
    UsePipes,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TrimPipe } from '../utils/Trimer';
import { getUserIdFromToken } from '../utils/utils';

import { AuthService } from './auth.services';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoleGuard } from './guards/roles.guard';
import { Roles } from './roles.decorator';

@Controller('users')
export class AuthController {
    constructor(
        @Inject(AuthService)
        private authService: AuthService
    ) { }

    @Roles('super')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @UsePipes(new TrimPipe())
    @Post()
    async signUp(
        @Res() res,
        @Body(ValidationPipe) authCredentialsDto: any,
    ): Promise<void> {
        const data = await this.authService.signUp(authCredentialsDto);
        if (data) {
            return res.status(200).json({
                response: {
                    message: 'User has been successfully created',
                    data,
                    id: data.id
                }
            });
        } else {
            return res.status(200).json({
                message: 'User exist',
            });
        }
    }


    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {}

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        return await this.authService.updateToken(req.user)
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateProperty(
        @Res() res,
        @Body() UserBody: any,
    ) {
        const userId = getUserIdFromToken(res.req.headers.authorization);
        const updated = await this.authService.updateUser(userId, UserBody);
        if (!updated) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'User has been successfully updated',
            updated,
        });
    }

    @Get('image')
    async getImage(
        @Res() res,
    ) {
        const image = await this.authService.getImage();
        return res.status(200).json({
            message: 'Avatar has been successfully get',
            data: image.avatar,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllUsers(
        @Query('filter') filter: string,
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Query('orderBy') orderBy: string,
        @Query('orderDir') orderDir: string,
    ) {
        const users = await this.authService.getUsers(filter, limit, page, orderBy, orderDir);
        return users;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUser(
        @Param('id') userId: string,
    ) {
        return await this.authService.findUser(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async removeUser(
        @Res() res,
        @Param('id')
        deletedId: string) {
        const userId = getUserIdFromToken(res.req.headers.authorization);
        if (userId !== deletedId) {
            const userDelete = await this.authService.deleteUser(deletedId);
            if (!userDelete) {
                throw new NotFoundException('Id does not exist!');
            }
            return res.status(200).json({
                message: 'User has been successfully deleted',
                userDelete,
            });
        } else {
            return res.status(500).json({
                message: 'Can not delete',
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    async removeUsers(
        @Res() res,
        @Body() ids) {
        const userId = getUserIdFromToken(res.req.headers.authorization);
        const deletebleUsers = ids.ids.filter(item => item != userId);
        const users = await this.authService.deleteUsers(deletebleUsers);
        if (!users) {
            throw new NotFoundException('Id does not exist!');
        }
        return res.status(200).json({
            message: 'Users has been successfully deleted',
            users,
        });
    }

    @UsePipes(new TrimPipe())
    @Post('signin')
    async signIn(@Request() req) {
        return await this.authService.signIn(req.body.username, req.body.password);
    }
}
