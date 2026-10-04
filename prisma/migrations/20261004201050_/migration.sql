/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Faq` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Faq` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Faq" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
