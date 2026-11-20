import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordGatewayDto {
  @ApiProperty({})
  @IsString()
  currentPassword!: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 12,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  newPassword!: string;
}
