import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post, PostStatus } from '@project/shared/app/types';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPostDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'likes') orderBy = { likes: { _count: 'desc' } };
    if (query.sortBy === 'comments') orderBy = { comments: { _count: 'desc' } };

    return this.prisma.post.findMany({
      where: {
        authorId: query.authorId,
        status: query.status,
        title: query.search
          ? { contains: query.search, mode: 'insensitive' }
          : undefined,
      },
      take: query.limit,
      skip: query.offset,
      orderBy,
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });
    if (!post) return null;
    return { ...(post as Post), status: post.status as PostStatus };
  }

  async create(dto: CreatePostDto, authorId: string) {
    const tags = dto.tags
      ? [...new Set(dto.tags.map((t) => t.toLowerCase()))].slice(0, 8)
      : [];

    return this.prisma.post.create({
      data: {
        type: dto.type,
        title: dto.title ?? '',
        content: dto.content ?? '',
        announce: dto.announce,
        videoUrl: dto.videoUrl,
        quoteText: dto.quoteText,
        quoteAuthor: dto.quoteAuthor,
        imageUrl: dto.imageUrl,
        linkUrl: dto.linkUrl,
        linkDescription: dto.linkDescription,
        tags,
        authorId,
        status: 'published',
      },
    });
  }

  async repost(postId: string, userId: string) {
    const original = await this.findById(postId);
    if (!original) return null;

    const existing = await this.prisma.post.findUnique({
      where: {
        authorId_originalPostId: {
          authorId: userId,
          originalPostId: postId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Вы уже делали репост');
    }

    return this.prisma.post.create({
      data: {
        type: original.type,
        title: original.title,
        content: original.content,
        announce: original.announce,
        videoUrl: original.videoUrl,
        quoteText: original.quoteText,
        quoteAuthor: original.quoteAuthor,
        imageUrl: original.imageUrl,
        linkUrl: original.linkUrl,
        linkDescription: original.linkDescription,
        tags: original.tags,
        authorId: userId,
        isRepost: true,
        originalPostId: original.id,
        originalAuthorId: original.authorId,
        status: 'published',
      },
    });
  }

  async countByAuthor(authorId: string): Promise<number> {
    return this.prisma.post.count({
      where: { authorId, status: 'published' },
    });
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
      return { ...(post as Post), status: post.status as PostStatus };
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

  async addLike(postId: string, userId: string) {
    try {
      await this.prisma.like.create({
        data: { postId, userId },
      });
      return this.findById(postId);
    } catch {
      return this.findById(postId);
    }
  }

  async removeLike(postId: string, userId: string) {
    await this.prisma.like.deleteMany({
      where: { postId, userId },
    });
    return this.findById(postId);
  }

  async getNewPostsForMailing() {
    let state = await this.prisma.mailingState.findUnique({
      where: { id: 'global' },
    });
    if (!state) {
      state = await this.prisma.mailingState.create({ data: { id: 'global' } });
    }

    const lastSentAt = state.lastSentAt;

    const posts = await this.prisma.post.findMany({
      where: {
        createdAt: { gt: lastSentAt },
        status: 'published',
        isRepost: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    await this.prisma.mailingState.update({
      where: { id: 'global' },
      data: { lastSentAt: new Date() },
    });

    return posts;
  }
}
