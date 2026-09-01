/*
  Warnings:

  - You are about to drop the column `customSlug` on the `client_portal` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "client_portal_customSlug_key";

-- AlterTable
ALTER TABLE "client_portal" DROP COLUMN "customSlug";
