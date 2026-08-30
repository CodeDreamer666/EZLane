/*
  Warnings:

  - You are about to drop the column `issuer` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "issuer" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "issuer";
