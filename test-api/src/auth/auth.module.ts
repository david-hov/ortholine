import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.services';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { Users } from './schemas/users.entity';
import { Roles } from './schemas/roles.entity';
import { Doctors } from '../doctors/schemas/doctors.entity';
import { Settings } from '../settings/schemas/settings.entity';
import { AppGateway } from '../app.gateway';
import { GoogleStrategy } from './strategies/google.strategy';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forFeature([
            Roles,
            Users,
            Doctors,
            Settings,
        ]),
        PassportModule,
        {
            ...JwtModule.register({
                secret: process.env.JWT_SECRET,
            }),
            global: true
        }
    ],
    providers: [AuthService, AppGateway, LocalStrategy, JwtStrategy, GoogleStrategy],
    // providers: [AuthService, LocalStrategy, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService,],
})

export class AuthModule { }
