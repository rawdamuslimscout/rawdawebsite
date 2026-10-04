-- DropIndex
DROP INDEX "ScoutLeader_stageId_order_idx";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" TEXT,
    "resource" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "meta" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'about',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgNode" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "stageId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OrgNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgPerson" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "rank" TEXT NOT NULL DEFAULT '',
    "section" TEXT NOT NULL DEFAULT '',
    "education" TEXT NOT NULL DEFAULT '',
    "fieldOfStudy" TEXT NOT NULL DEFAULT '',
    "occupation" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "showEducation" BOOLEAN NOT NULL DEFAULT true,
    "showOccupation" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgAssignment" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrgAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrgQualification" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL DEFAULT '',
    "year" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrgQualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "Faq_isPublished_category_order_idx" ON "Faq"("isPublished", "category", "order");

-- CreateIndex
CREATE INDEX "OrgNode_parentId_order_idx" ON "OrgNode"("parentId", "order");

-- CreateIndex
CREATE INDEX "OrgAssignment_nodeId_order_idx" ON "OrgAssignment"("nodeId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OrgAssignment_nodeId_personId_title_key" ON "OrgAssignment"("nodeId", "personId", "title");

-- CreateIndex
CREATE INDEX "OrgQualification_personId_order_idx" ON "OrgQualification"("personId", "order");

-- AddForeignKey
ALTER TABLE "OrgNode" ADD CONSTRAINT "OrgNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "OrgNode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgNode" ADD CONSTRAINT "OrgNode_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "ScoutStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAssignment" ADD CONSTRAINT "OrgAssignment_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "OrgNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgAssignment" ADD CONSTRAINT "OrgAssignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "OrgPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrgQualification" ADD CONSTRAINT "OrgQualification_personId_fkey" FOREIGN KEY ("personId") REFERENCES "OrgPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
