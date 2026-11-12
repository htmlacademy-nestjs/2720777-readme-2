import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
  @ApiOperation({ summary: 'Список публикаций с фильтрацией и пагинацией' })
  async findAll(@Query() query: QueryPostDto) {
    return this.postService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({})
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: PostRdo })
  @ApiResponse({ status: 404, description: 'Публикация не найдена' })
  async findById(@Param('id') id: string): Promise<PostRdo> {
    const post = await this.postService.findById(id);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Post()
  @ApiOperation({})
  @ApiResponse({ status: 201, type: PostRdo })
  async create(@Body() dto: CreatePostDto): Promise<PostRdo> {
    const authorId = '00000000-0000-0000-0000-000000000000';
    const post = await this.postService.create(dto, authorId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @ApiOperation({})
  @ApiResponse({ status: 200, type: PostRdo })
  @ApiResponse({ status: 404, description: 'Публикация не найдена' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostRdo> {
    const post = await this.postService.update(id, dto);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({})
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    await this.postService.remove(id);
  }

  @Post(':id/repost')
  @ApiOperation({})
  @ApiResponse({ status: 201, type: PostRdo })
  async repost(@Param('id') id: string): Promise<PostRdo> {
    const userId = '00000000-0000-0000-0000-000000000000';
    const post = await this.postService.repost(id, userId);
    return plainToInstance(PostRdo, post, { excludeExtraneousValues: true });
  }
}
