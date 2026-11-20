/*
  Warnings:

  - The `status` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[authorId,originalPostId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('text', 'video', 'quote', 'photo', 'link');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "announce" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isRepost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkDescription" TEXT,
ADD COLUMN     "linkUrl" TEXT,
ADD COLUMN     "originalAuthorId" TEXT,
ADD COLUMN     "originalPostId" TEXT,
ADD COLUMN     "quoteAuthor" TEXT,
ADD COLUMN     "quoteText" TEXT,
ADD COLUMN     "type" "PostType" NOT NULL DEFAULT 'text',
ADD COLUMN     "videoUrl" TEXT,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE UNIQUE INDEX "Post_authorId_originalPostId_key" ON "Post"("authorId", "originalPostId");
