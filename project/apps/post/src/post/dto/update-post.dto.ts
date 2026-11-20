import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { PostStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ enum: PostStatus })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}
