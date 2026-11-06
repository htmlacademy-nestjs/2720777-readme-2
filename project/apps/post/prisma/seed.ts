import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const post = await prisma.post.create({
    data: {
      title: 'Первый!цвв',
      content: 'Карл у Клары украл коралыыыы',
      authorId: '1234',
      tags: ['prisma', 'postgres'],
      status: 'published',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post.id,
      authorId: '4321',
      content: 'Крутяк!',
    },
  });

  console.log('База засижена');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
