import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentGatewayDto {
  @ApiProperty({})
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  content!: string;
}
