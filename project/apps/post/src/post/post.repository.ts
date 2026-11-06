import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.post.findMany();
  }

  findById(id: string) {
    return this.prisma.post.findUnique({ where: { id } });
  }

  create(dto: CreatePostDto, authorId: string) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        tags: dto.tags ?? [],
        status: dto.status ?? 'draft',
        authorId,
      },
    });
  }

  update(id: string, dto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}
