import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
      throw new NotFoundException('Пост не найден');
    }
    return post;
  }

  async countByAuthor(authorId: string) {
    return this.postRepository.countByAuthor(authorId);
  }

  async create(dto: CreatePostDto, authorId: string): Promise<Post> {
    const post = await this.postRepository.create(dto, authorId);
    return post as Post;
  }

  async update(id: string, dto: UpdatePostDto, userId: string): Promise<Post> {
    const post = await this.findById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('Вы можете редачить только свои посты');
    }

    const updatedPost = await this.postRepository.update(id, dto);
    if (!updatedPost) {
      throw new NotFoundException('Не удалось обновить пост');
    }

    return updatedPost;
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findById(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('Можно удалять только свои публикации');
    }
    await this.postRepository.remove(id);
  }

  async repost(postId: string, userId: string): Promise<Post> {
    const repost = await this.postRepository.repost(postId, userId);
    if (!repost) {
      throw new NotFoundException('Исходная публикация не найдена');
    }
    return repost as Post;
  }

  async addLike(postId: string, userId: string) {
    const post = await this.postRepository.addLike(postId, userId);
    if (!post) {
      throw new NotFoundException('Пост не найден');
    }
    return post;
  }

  async removeLike(postId: string, userId: string) {
    const post = await this.postRepository.removeLike(postId, userId);
    if (!post) {
      throw new NotFoundException('Пост не найден');
    }
    return post;
  }

  async getNewPostsForMailing() {
    return this.postRepository.getNewPostsForMailing();
  }
}
