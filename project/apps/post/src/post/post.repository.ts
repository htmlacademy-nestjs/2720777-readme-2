import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, PostStatus } from '@project/shared/app/types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPostDto) {
    return this.prisma.post.findMany({
      where: {
        authorId: query.authorId,
        status: query.status,
        // title: query.search
        //   ? { contains: query.search, mode: 'insensitive' }
        //   : undefined,
      },
      take: query.limit,
      skip: query.offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) return null;
    return { ...post, status: post.status as PostStatus };
  }

  async create(dto: CreatePostDto, authorId: string): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        tags: dto.tags ?? [],
        status: dto.status ?? PostStatus.Draft,
        authorId,
      },
    });
    return { ...post, status: post.status as PostStatus };
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post | null> {
    try {
      const post = await this.prisma.post.update({
        where: { id },
        data: {
          title: dto.title,
          content: dto.content,
          tags: dto.tags,
          status: dto.status,
        },
      });
      return { ...post, status: post.status as PostStatus };
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await this.prisma.post.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
