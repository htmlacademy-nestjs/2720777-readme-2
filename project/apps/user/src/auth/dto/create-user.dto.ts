import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ required: true })
  @IsEmail({}, { message: 'Некорректный email' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(3, { message: 'Имя должено быть не менее 3 символов' })
  @MaxLength(50, { message: 'Имя должено быть не больше 50 символов' })
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(12, { message: 'Пароль должен быть не больше 12 символов' })
  password!: string;
}
