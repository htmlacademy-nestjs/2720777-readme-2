import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import {
  RmqContext,
  Ctx,
  Payload,
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

export interface EmailTask {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private client: ClientProxy;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [
          this.configService.get<string>('RABBITMQ_URL') ||
            'amqp://admin:admin@localhost:5672',
        ],
        queue: this.configService.get<string>('RABBITMQ_QUEUE') || 'queue',
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async triggerMailing() {
    const task: EmailTask = {
      to: 'test@test.ru',
      subject: 'Тест',
      text: 'письмо отправлено',
    };

    this.client.emit('send_email', task);
    this.logger.log(`Отправка письма для ${task.to} добавлена в очередь`);

    return { status: 'queued', message: 'Task added to queue' };
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
