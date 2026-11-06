import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPostId(postId: string) {
    return this.prisma.comment.findMany({ where: { postId } });
  }

  findById(id: string) {
    return this.prisma.comment.findUnique({ where: { id } });
  }

  create(postId: string, dto: CreateCommentDto, authorId: string) {
    return this.prisma.comment.create({
      data: {
        postId,
        content: dto.content,
        authorId,
      },
    });
  }

  update(id: string, dto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
