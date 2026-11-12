import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@project/shared/app/types';
import { UserRepository } from './user.repository';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getHash(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await this.getHash(dto.password);

    return this.userRepository.createUser({
      email: dto.email,
      name: dto.name,
      role: UserRole.User,
      passwordHash,
    });
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isValid = await this.comparePassword(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    const newHash = await this.getHash(dto.newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    return { message: 'Пароль успешно изменен' };
  }
}
