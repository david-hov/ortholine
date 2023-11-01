import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Settings } from './schemas/settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>,
    ) {}

    async insertSettings(body) {
        const newSettings = this.settingsRepository.create({
            xRayPrice: body.xRayPrice,
            printDetailsInfo: body.printDetailsInfo
        });
        const result = await this.settingsRepository.save(newSettings);
        return result;
    }

    async getAllSettings() {
        const result = await this.settingsRepository.find();
        return {
            data: result,
            count: 1,
        };
    }

    async getSetting(settingsId: string) {
        const settings = await this.getSettings(settingsId);
        return settings
    }

    async getWaitersSettings() {
        const waitersSettings = await this.settingsRepository
            .createQueryBuilder('settings')
            .getMany()
        return {
            waitersSettings: waitersSettings[0],
        };
    }

    async updateSettings(id, body): Promise<any> {
        if (body.hasOwnProperty('companyImage') && body.companyImage !== null) {
            body.companyImage = `data:${body.companyImage.type};base64,${body.companyImage.data}`;
        }
        return await this.settingsRepository.update(
            { id: id },
            body,
        );
    }

    private async getSettings(id: string): Promise<Settings> {
        let settings;
        try {
            settings = await this.settingsRepository.findOne({ id: id });
            delete settings.companyImage;
        } catch (error) {
            throw new NotFoundException('Could not find settings.');
        }
        if (!settings) {
            throw new NotFoundException('Could not find settings.');
        }
        return settings;
    }
}
