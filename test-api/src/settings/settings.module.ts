import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Settings } from './schemas/settings.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
        Settings
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports:[SettingsService]
})
export class SettingsModule {}
