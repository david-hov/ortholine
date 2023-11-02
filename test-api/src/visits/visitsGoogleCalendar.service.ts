import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class VisitsGoogleCalendarService {
    private readonly calendar = google.calendar('v3');
    async addEvent(body: any, accessToken: any) {
        const auth = await this.getOAuth2Client(accessToken);
        const calendarId = 'primary';
        const template = body.clients.clientsTemplates ? body.clients.clientsTemplates.name : 'Չկա'
        const info = body.info ? body.info : 'Չկա'
        const insurance = body.insurance ? body.insurance.name : 'Չկա'
        const desc = 'Աղբյուր - ' + template + '\n' +
            'Նշում - ' + info + '\n' +
            'Ապպա -' + insurance;
        const event = {
            'summary': body.clients.name,
            'description': desc,
            'start': {
                'dateTime': new Date(body.startDate),
                'timeZone': 'Asia/Yerevan',
            },
            'end': {
                'dateTime': new Date(body.endDate),
                'timeZone': 'Asia/Yerevan',
            },
        };
        try {
            // @ts-ignore
            const response: any = await this.calendar.events.insert({
                auth: auth,
                calendarId: body.doctors.calendarId ? body.doctors.calendarId : calendarId,
                resource: event,
            });
            console.log('Event added');
            return response.data.id
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }

    async deleteEvent(googleCalendarEventId: any, data: any) {
        const auth = await this.getOAuth2Client(data.googleToken);
        try {
            // @ts-ignore
            const response: any = await this.calendar.events.delete({
                auth: auth,
                calendarId: data.doctors.calendarId ? data.doctors.calendarId : 'primary',
                eventId: googleCalendarEventId,
            });
            console.log('Event deleted:');
            return response;
        } catch (error) {
            console.log('Error deleting event:', error);
        }
    }

    async updateEvent(body: any, accessToken: any) {
        const auth = await this.getOAuth2Client(accessToken);
        const template = body.clients.clientsTemplates ? body.clients.clientsTemplates.name : 'Չկա'
        const info = body.info ? body.info : 'Չկա'
        const insurance = body.insurance ? body.insurance.name : 'Չկա'
        const desc = 'Աղբյուր - ' + template + '\n' +
            'Նշում - ' + info + '\n' +
            'Ապպա -' + insurance;
        const event = {
            'summary': body.clients.name,
            'description': desc,
            'start': {
                'dateTime': new Date(body.startDate),
                'timeZone': 'Asia/Yerevan',
            },
            'end': {
                'dateTime': new Date(body.endDate),
                'timeZone': 'Asia/Yerevan',
            },
        };

        try {
            // @ts-ignore
            const response: any = await this.calendar.events.patch({
                auth: auth,
                calendarId: 'primary',
                eventId: body.googleCalendarEventId,
                resource: event
            });
            return response;
        } catch (error) {
            console.log('Error adding event:', error);
        }
    }

    private async getOAuth2Client(oauth_token: string) {
        const credentials = {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_SECRET,
        };

        const auth = new google.auth.OAuth2(
            credentials.client_id,
            credentials.client_secret,
        );
        auth.setCredentials({ refresh_token: oauth_token });
        // const refreshedCredentials = await auth.refreshAccessToken();
        // console.log(refreshedCredentials)
        return auth;
    }
}