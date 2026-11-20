import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { RmqContext, Ctx, Payload } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface EmailTask {
  to: string;
  subject: string;
  text: string;
}

interface PostFromApi {
  id: string;
  title?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async triggerMailing() {
    try {
      const postServiceUrl =
        this.configService.get('POST_SERVICE_URL') ||
        'http://localhost:3002/api';
      const userServiceUrl =
        this.configService.get('USER_SERVICE_URL') ||
        'http://localhost:3001/api';

      const { data: posts } = await firstValueFrom(
        this.httpService.get(`${postServiceUrl}/posts/mailing/new`),
      );

      if (!posts || posts.length === 0) {
        return { status: 'success', message: 'Нет новых постов для рассылки' };
      }

      const { data: emails } = await firstValueFrom(
        this.httpService.get(`${userServiceUrl}/users/emails/all`),
      );

      if (!emails || emails.length === 0) {
        return { status: 'success', message: 'Нет пользователей для рассылки' };
      }

      const postsHtml = posts
        .map(
          (p: PostFromApi) =>
            `<li><a href="http://localhost:3000/api/posts/${p.id}">${p.title || 'Без названия'}</a></li>`,
        )
        .join('');

      const htmlBody = `
        <h2>Привет!</h2>
        <p>Вот новые посты в нашем блоге:</p>
        <ul>${postsHtml}</ul>
        <p>Читайте нас на <a href="http://localhost:3000">Readme</a>!</p>
      `;

      let sentCount = 0;
      for (const email of emails) {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Новые публикации в Readme',
          html: htmlBody,
        });
        sentCount++;
      }

      this.logger.log(`Рассылка отправлена на ${sentCount} email'ов`);
      return {
        status: 'success',
        message: 'Рассылка выполнена',
        count: sentCount,
      };
    } catch (error) {
      this.logger.error('Ошибка при рассылке', error);
      throw new Error('Не удалось выполнить рассылку');
    }
  }

  async handleSendEmail(
    @Payload() task: EmailTask,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.mailerService.sendMail({
        to: task.to,
        subject: task.subject,
        text: task.text,
      });

      channel.ack(originalMsg);
      this.logger.log(`Письмо для ${task.to} отправлено`);
    } catch (error) {
      this.logger.error('Ошибка отправки письма', error);
      channel.nack(originalMsg, false, true);
    }
  }
}
