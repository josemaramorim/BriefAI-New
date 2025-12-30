/*
  Warnings:

  - A unique constraint covering the columns `[templateId,key]` on the table `blocks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "blocks" ADD COLUMN     "key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "blocks_templateId_key_key" ON "blocks"("templateId", "key");
