import { SetMetadata } from '@nestjs/common';

export enum Role {
    SUPER = 'super',
    ADMINISTRATION = 'administration',
    DOCTOR = 'doctor',
}

export const ROLES_KEY = 'roles';
export const Roles = (...args: string[]) => SetMetadata(ROLES_KEY, args);
