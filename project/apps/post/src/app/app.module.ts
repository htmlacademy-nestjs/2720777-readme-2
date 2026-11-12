import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../auth/interfaces/strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/post/.env',
    }),
    PassportModule,
    PostModule,
    CommentModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
