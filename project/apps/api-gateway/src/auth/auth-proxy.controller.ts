import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
  Headers,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoginGatewayDto } from './dto/signin.dto';
import { RegisterGatewayDto } from './dto/signup.dto';
import { ChangePasswordGatewayDto } from './dto/change-password.dto';

@ApiTags('Auth & Users')
@Controller()
export class AuthProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Post('auth/register')
  @ApiOperation({})
  async register(@Body() dto: RegisterGatewayDto) {
    const url = `${this.configService.get('USER_SERVICE_URL')}/auth/register`;
    const { data } = await firstValueFrom(this.httpService.post(url, dto));
    return data;
  }

  @Post('auth/login')
  @ApiOperation({})
  async login(@Body() dto: LoginGatewayDto) {
    const url = `${this.configService.get('USER_SERVICE_URL')}/auth/login`;
    const { data } = await firstValueFrom(this.httpService.post(url, dto));
    return data;
  }

  @Get('users/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Информация о пользователе' })
  async findUser(@Param('id') id: string) {
    const baseUrl = this.configService.get('USER_SERVICE_URL');

    const { data: user } = await firstValueFrom(
      this.httpService.get(`${baseUrl}/users/${id}`),
    );

    let subscribersCount = 0;
    try {
      const { data: stats } = await firstValueFrom(
        this.httpService.get(`${baseUrl}/users/${id}/stats`),
      );
      subscribersCount = stats.subscribersCount || 0;
    } catch (e) {
      if (e instanceof Error) {
        console.warn('Не удалось получить статистику пользователя');
      }
    }

    let postsCount = 0;
    try {
      const countUrl = `${this.configService.get('POST_SERVICE_URL')}/posts/count/${id}`;
      const { data: countData } = await firstValueFrom(
        this.httpService.get(countUrl),
      );
      postsCount = countData.count;
    } catch (e) {
      if (e instanceof Error) {
        console.warn('Не удалось получить количество постов', e.message);
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      registeredAt: user.createdAt,
      postsCount: postsCount,
      subscribersCount: subscribersCount,
    };
  }

  @Patch('users/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сменить пароль' })
  async changePassword(
    @Body() dto: ChangePasswordGatewayDto,
    @Headers('Authorization') authHeader: string,
  ) {
    const url = `${this.configService.get('USER_SERVICE_URL')}/users/change-password`;

    const { data } = await firstValueFrom(
      this.httpService.patch(url, dto, {
        headers: { Authorization: authHeader },
      }),
    );
    return data;
  }

  @Post('users/:id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Подписаться на пользователя' })
  async subscribe(
    @Param('id') targetId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const url = `${this.configService.get('USER_SERVICE_URL')}/users/${targetId}/subscribe`;
    const { data } = await firstValueFrom(
      this.httpService.post(
        url,
        {},
        { headers: { Authorization: authHeader } },
      ),
    );
    return data;
  }

  @Delete('users/:id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  async unsubscribe(
    @Param('id') targetId: string,
    @Headers('Authorization') authHeader: string,
  ) {
    const url = `${this.configService.get('USER_SERVICE_URL')}/users/${targetId}/subscribe`;
    const { data } = await firstValueFrom(
      this.httpService.delete(url, { headers: { Authorization: authHeader } }),
    );
    return data;
  }
}
