import {
  BadRequestException,
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

  async getAllEmails(): Promise<string[]> {
    return this.userRepository.findAllEmails();
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

  async getUserStats(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Пользователь не найден');

    return {
      subscribersCount: user.subscribers?.length || 0,
    };
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
      throw new UnauthorizedException('Неверный пароль');
    }

    const newHash = await this.getHash(dto.newPassword);
    await this.userRepository.updatePassword(userId, newHash);

    return { message: 'Пароль изменен' };
  }

  async subscribe(userId: string, targetId: string) {
    if (userId === targetId) {
      throw new BadRequestException('Нельзя подписаться на себя');
    }
    const target = await this.userRepository.findById(targetId);
    if (!target) throw new NotFoundException('Пользователь не найден');

    await this.userRepository.subscribe(userId, targetId);
    return { message: 'Вы подписались' };
  }

  async unsubscribe(userId: string, targetId: string) {
    await this.userRepository.unsubscribe(userId, targetId);
    return { message: 'Вы отписались' };
  }
}
