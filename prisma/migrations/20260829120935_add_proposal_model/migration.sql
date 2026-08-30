-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'CLIENT_COMMENTED', 'REVISED', 'ACCEPTED');

-- CreateTable
CREATE TABLE "proposal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "due" TEXT NOT NULL DEFAULT '',
    "deliverables" TEXT[],
    "body" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "font" TEXT,
    "fontSize" TEXT,
    "lastSavedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_userId_idx" ON "proposal"("userId");

-- CreateIndex
CREATE INDEX "proposal_clientId_idx" ON "proposal"("clientId");

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
