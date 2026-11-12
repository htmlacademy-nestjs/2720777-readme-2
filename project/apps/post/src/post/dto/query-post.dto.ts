import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { PostStatus } from '@project/shared/app/types';

export class QueryPostDto {
  @ApiPropertyOptional({
    default: 25,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 25;

  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Статус публикации',
    enum: PostStatus,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  search?: string;
}
