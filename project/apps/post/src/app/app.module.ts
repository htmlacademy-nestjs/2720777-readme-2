import { Module } from '@nestjs/common';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PostModule, CommentModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
