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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRdo } from './rdo/comment.rdo';
import { QueryCommentDto } from './dto/query-comment.dto';
import { JwtAuthGuard } from '../auth/interfaces/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/interfaces/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiOperation({ summary: 'Список комментариев публикации' })
  async findAll(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: QueryCommentDto,
  ) {
    const comments = await this.commentService.findByPostId(postId, query);
    return comments.map((comment) =>
      plainToInstance(CommentRdo, comment, { excludeExtraneousValues: true }),
    );
  }

  @Get(':commentId')
  @ApiOperation({})
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'commentId' })
  @ApiResponse({ status: 200, type: CommentRdo })
  @ApiResponse({ status: 404 })
  async findById(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ): Promise<CommentRdo> {
    const comment = await this.commentService.findById(postId, commentId);
    return plainToInstance(CommentRdo, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать комментарий' })
  @ApiParam({ name: 'postId' })
  @ApiResponse({ status: 201, type: CommentRdo })
  @ApiResponse({ status: 404 })
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CommentRdo> {
    const comment = await this.commentService.create(postId, dto, user.id);
    return plainToInstance(CommentRdo, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':commentId')
  @ApiOperation({})
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'commentId' })
  @ApiResponse({ status: 200, type: CommentRdo })
  @ApiResponse({ status: 404 })
  async update(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentRdo> {
    const comment = await this.commentService.update(postId, commentId, dto);
    return plainToInstance(CommentRdo, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({})
  @ApiParam({ name: 'postId' })
  @ApiParam({ name: 'commentId' })
  @ApiResponse({ status: 204 })
  @ApiResponse({ status: 404 })
  async remove(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    await this.commentService.remove(postId, commentId);
  }
}
