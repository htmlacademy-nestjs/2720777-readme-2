import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Текущий пароль' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ description: 'Новый пароль', minLength: 6, maxLength: 12 })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  newPassword!: string;
}
