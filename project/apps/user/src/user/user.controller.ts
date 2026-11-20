import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
  Body,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { UserRdo } from './rdo/user.rdo';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get(':id')
  @ApiOperation({})
  @ApiResponse({ status: 200, type: UserRdo })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return plainToInstance(UserRdo, user, { excludeExtraneousValues: true });
  }

  @Get('emails/all')
  @ApiOperation({ summary: 'Получить email всех пользователей для рассылки' })
  async getAllEmails() {
    return this.userService.getAllEmails();
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Статистика пользователя' })
  async getStats(@Param('id') id: string) {
    return this.userService.getUserStats(id);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, dto);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписаться на пользователя' })
  async subscribe(
    @Param('id') targetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.userService.subscribe(user.id, targetId);
  }

  @Delete(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  async unsubscribe(
    @Param('id') targetId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.userService.unsubscribe(user.id, targetId);
  }
}
