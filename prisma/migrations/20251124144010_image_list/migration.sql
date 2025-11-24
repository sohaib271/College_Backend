/*
  Warnings:

  - The `postImage` column on the `Posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "postImage",
ADD COLUMN     "postImage" TEXT[];
