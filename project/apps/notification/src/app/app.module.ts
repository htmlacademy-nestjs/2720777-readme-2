import { Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/notification/.env',
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: config.get('SMTP_PORT'),
          auth: config.get('SMTP_USER')
            ? {
                user: config.get('SMTP_USER'),
                pass: config.get('SMTP_PASS'),
              }
            : undefined,
        },
        defaults: {
          from: `"Readme Blog" <${config.get('SMTP_FROM')}>`,
        },
      }),
    }),
    NotificationModule,
  ],
})
export class AppModule {}
