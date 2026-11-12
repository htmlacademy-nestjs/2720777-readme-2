import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '@project/shared/app/types';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async findByPostId(
    postId: string,
    query: QueryCommentDto,
  ): Promise<Comment[]> {
    await this.ensurePostExists(postId);
    return this.commentRepository.findByPostId(postId, query);
  }

  async findById(postId: string, commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment || comment.postId !== postId) {
      throw new NotFoundException('Комментарий не найден');
    }
    return comment;
  }

  async create(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    await this.ensurePostExists(postId);
    return this.commentRepository.create(postId, dto, authorId);
  }

  async update(
    postId: string,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    await this.findById(postId, commentId);
    const updated = await this.commentRepository.update(commentId, dto);
    if (!updated) {
      throw new NotFoundException('Комментарий не найден');
    }
    return updated;
  }

  async remove(postId: string, commentId: string): Promise<void> {
    await this.findById(postId, commentId);
    const removed = await this.commentRepository.remove(commentId);
    if (!removed) {
      throw new NotFoundException('Комментарий не найден');
    }
  }

  private async ensurePostExists(postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Публикация не найдена');
    }
  }
}
