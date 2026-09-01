/*
  Warnings:

  - You are about to drop the column `portalPassword` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "portalPassword";

-- CreateTable
CREATE TABLE "client_portal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "urlToken1" TEXT NOT NULL,
    "urlToken2" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "customSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_comment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_clientId_key" ON "client_portal"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_urlToken1_key" ON "client_portal"("urlToken1");

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_customSlug_key" ON "client_portal"("customSlug");

-- CreateIndex
CREATE INDEX "proposal_comment_proposalId_idx" ON "proposal_comment"("proposalId");

-- AddForeignKey
ALTER TABLE "client_portal" ADD CONSTRAINT "client_portal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_comment" ADD CONSTRAINT "proposal_comment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
