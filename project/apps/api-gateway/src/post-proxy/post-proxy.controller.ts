import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreatePostGatewayDto } from './dto/create-post.dto';
import { UpdatePostGatewayDto } from './dto/update-post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostProxyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get postUrl() {
    return `${this.configService.get('POST_SERVICE_URL')}/posts`;
  }

  @Get()
  @ApiOperation({})
  async findAll(@Query() query: Record<string, unknown>) {
    const { data } = await firstValueFrom(
      this.httpService.get(this.postUrl, { params: query }),
    );
    return data;
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Лента пользователя' })
  async getFeed(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: Record<string, unknown>,
  ) {
    const userServiceUrl = this.configService.get('USER_SERVICE_URL');
    let subscriptions: string[] = [];
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${userServiceUrl}/users/subscriptions/me`, {
          headers: { 'X-User-Id': user.id },
        }),
      );
      subscriptions = data;
    } catch (e) {
      console.warn('Не удалось получить подписки', e);
    }

    const authorIds = [...new Set([...subscriptions, user.id])];

    const postServiceUrl = this.configService.get('POST_SERVICE_URL');
    const { data: posts } = await firstValueFrom(
      this.httpService.get(`${postServiceUrl}/posts`, {
        params: { ...query, authorIds: authorIds },
      }),
    );

    return posts;
  }

  @Get(':id')
  @ApiOperation({})
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.postUrl}/${id}`),
    );
    return data;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  async create(
    @Body() dto: CreatePostGatewayDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { data } = await firstValueFrom(
      this.httpService.post(this.postUrl, dto, {
        headers: { 'X-User-Id': user.id },
      }),
    );
    return data;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostGatewayDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { data } = await firstValueFrom(
      this.httpService.patch(`${this.postUrl}/${id}`, dto, {
        headers: { 'X-User-Id': user.id },
      }),
    );
    return data;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({})
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await firstValueFrom(
      this.httpService.delete(`${this.postUrl}/${id}`, {
        headers: { 'X-User-Id': user.id },
      }),
    );
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  async like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.postUrl}/${id}/like`,
        {},
        { headers: { 'X-User-Id': user.id } },
      ),
    );
    return data;
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  async unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.postUrl}/${id}/like`, {
        headers: { 'X-User-Id': user.id },
      }),
    );
    return data;
  }

  @Post(':id/repost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({})
  async repost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.postUrl}/${id}/repost`,
        {},
        { headers: { 'X-User-Id': user.id } },
      ),
    );
    return data;
  }
}
