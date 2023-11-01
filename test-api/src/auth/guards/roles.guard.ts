import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector, @Inject(JwtService) private jwtService: JwtService) { }

    matchRoles(roles: string[], userRole: string) {
        return roles.some((role) => role === userRole);
    }

    canActivate(context: ExecutionContext) {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const headerToken = request.headers.authorization.split(" ")
        if (headerToken[1]) {
            const decodedJwtAccessToken = this.jwtService.decode(headerToken[1]);
            const role = JSON.parse(JSON.stringify(decodedJwtAccessToken)).role;
            return this.matchRoles(roles, role);
        } else {
            return this.matchRoles(roles, '');
        }
    }
}