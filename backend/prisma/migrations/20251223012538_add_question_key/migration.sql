/*
  Warnings:

  - A unique constraint covering the columns `[blockId,key]` on the table `questions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "questions_blockId_key_key" ON "questions"("blockId", "key");
