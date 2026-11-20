import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostRdo } from './rdo/post.rdo';
import { QueryPostDto } from './dto/query-post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({ summary: 'Список постов с фильтрамиуу и пагинацией' })
  async findAll(@Query() query: QueryPostDto) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({})
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PostRdo })
  @ApiResponse({ status: 404, description: 'Публикации нет' })
  async findById(@Param('id') id: string): Promise<PostRdo> {
    const post = await this.postService.findById(id);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Get('count/:authorId')
  @ApiOperation({ summary: 'Количество публикаций автора' })
  async countByAuthor(@Param('authorId') authorId: string) {
    return { count: await this.postService.countByAuthor(authorId) };
  }

  @Get('mailing/new')
  @ApiOperation({ summary: 'Посты для рассылки' })
  async getNewPostsForMailing() {
    return this.postService.getNewPostsForMailing();
  }

  @Post()
  @ApiOperation({ summary: 'Создать публикацию' })
  @ApiResponse({ status: 201, type: PostRdo })
  async create(
    @Body() dto: CreatePostDto,
    @Headers('X-User-Id') userId: string,
  ): Promise<PostRdo> {
    if (!userId) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }
    const post = await this.postService.create(dto, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @Headers('X-User-Id') userId: string,
  ): Promise<PostRdo> {
    const post = await this.postService.update(id, dto, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-User-Id') userId: string,
  ): Promise<void> {
    await this.postService.remove(id, userId);
  }

  @Post(':id/repost')
  @ApiOperation({ summary: 'Репост' })
  @ApiResponse({ status: 201, type: PostRdo })
  async repost(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-User-Id') userId: string,
  ): Promise<PostRdo> {
    const post = await this.postService.repost(id, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Поставить лайк' })
  @ApiResponse({ status: 201, description: 'Лайк поставлен' })
  async like(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-User-Id') userId: string,
  ) {
    const post = await this.postService.addLike(id, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Delete(':id/like')
  @ApiOperation({ summary: 'Убрать лайк' })
  @ApiResponse({ status: 200, description: 'Лайк убран' })
  async unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-User-Id') userId: string,
  ) {
    const post = await this.postService.removeLike(id, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }
}
