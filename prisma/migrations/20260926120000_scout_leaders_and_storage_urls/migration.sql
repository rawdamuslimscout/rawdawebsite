ALTER TABLE "GalleryItem" ADD COLUMN "imageUrl" TEXT NOT NULL DEFAULT '';

CREATE TABLE "ScoutLeader" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScoutLeader_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ScoutLeader" ADD CONSTRAINT "ScoutLeader_stageId_fkey"
  FOREIGN KEY ("stageId") REFERENCES "ScoutStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ScoutLeader_stageId_order_idx" ON "ScoutLeader"("stageId", "order");