import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';
import { PostType } from '@project/shared/app/types';

export class CreatePostDto {
  @ApiProperty({ enum: PostType, default: PostType.Text })
  @IsEnum(PostType)
  type!: PostType;

  @ApiPropertyOptional({ description: 'Заголовок' })
  @ValidateIf((o) => o.type !== PostType.Quote)
  @IsString()
  @MinLength(20)
  @MaxLength(50)
  title?: string;

  @ApiPropertyOptional({ description: 'Анонс' })
  @ValidateIf((o) => o.type === PostType.Text)
  @IsString()
  @MinLength(50)
  @MaxLength(255)
  announce?: string;

  @ApiPropertyOptional({ description: 'Текст' })
  @ValidateIf((o) => o.type === PostType.Text)
  @IsString()
  @MinLength(100)
  @MaxLength(1024)
  content?: string;

  @ApiPropertyOptional({ description: 'Ссылка на YouTube' })
  @ValidateIf((o) => o.type === PostType.Video)
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ description: 'Текст цитаты' })
  @ValidateIf((o) => o.type === PostType.Quote)
  @IsString()
  @MinLength(20)
  @MaxLength(300)
  quoteText?: string;

  @ApiPropertyOptional({ description: 'Автор цитаты' })
  @ValidateIf((o) => o.type === PostType.Quote)
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  quoteAuthor?: string;

  @ApiPropertyOptional({ description: 'Ссылка на фото' })
  @ValidateIf((o) => o.type === PostType.Photo)
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Ссылка' })
  @ValidateIf((o) => o.type === PostType.Link)
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Описание ссылки' })
  @ValidateIf((o) => o.type === PostType.Link)
  @IsString()
  @MaxLength(300)
  linkDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  tags?: string[];
}
