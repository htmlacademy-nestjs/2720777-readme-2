import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

export interface EmailTask {
  to: string;
  subject: string;
  text: string;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('trigger')
  @ApiOperation({})
  async trigger() {
    return this.notificationService.triggerMailing();
  }

  @EventPattern('send_email')
  async handleSendEmail(
    @Payload() task: EmailTask,
    @Ctx() context: RmqContext,
  ) {
    return this.notificationService.handleSendEmail(task, context);
  }
}
