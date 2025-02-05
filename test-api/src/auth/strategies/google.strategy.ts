import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: 'http://localhost:3001/users/google/redirect',
            scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
        });
    }

    authorizationParams(): { [key: string]: string; } {
        return ({
          access_type: 'offline'
        });
      };

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
            refreshToken
        }
        return user
    }
}