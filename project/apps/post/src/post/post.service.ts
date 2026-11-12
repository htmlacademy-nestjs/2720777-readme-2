import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@project/shared/app/types';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async findAll(query: QueryPostDto) {
    return this.postRepository.findAll(query);
  }

  async findById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException('Публикация не найдена');
    }
    return post;
  }

  async create(dto: CreatePostDto, authorId: string): Promise<Post> {
    return this.postRepository.create(dto, authorId);
  }

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const updated = await this.postRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Публикация не найдена');
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.postRepository.remove(id);
    if (!removed) {
      throw new NotFoundException('Публикация не найдена');
    }
  }

  async repost(postId: string, userId: string): Promise<Post> {
    const original = await this.findById(postId);

    return this.postRepository.create(
      {
        title: `Репост: ${original.title}`,
        content: original.content,
        tags: original.tags,
        status: original.status,
      },
      userId,
    );
  }
}
