/*
  Warnings:

  - You are about to drop the column `userId` on the `Context` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Context" DROP CONSTRAINT "Context_userId_fkey";

-- AlterTable
ALTER TABLE "Context" DROP COLUMN "userId";
