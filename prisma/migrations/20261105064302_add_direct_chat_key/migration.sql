/*
  Warnings:

  - A unique constraint covering the columns `[directKey]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "directKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chats_directKey_key" ON "chats"("directKey");
