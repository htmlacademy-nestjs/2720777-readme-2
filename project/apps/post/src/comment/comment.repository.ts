import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentDto } from './dto/query-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPostId(postId: string, query: QueryCommentDto) {
    return this.prisma.comment.findMany({
      where: { postId },
      take: query.limit,
      skip: query.offset,
      orderBy: { createdAt: 'desc' }, // Сначала новые
    });
  }

  async findById(id: string) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  async create(postId: string, dto: CreateCommentDto, authorId: string) {
    return this.prisma.comment.create({
      data: {
        postId,
        content: dto.content,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
