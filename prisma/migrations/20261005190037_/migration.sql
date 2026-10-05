-- AlterTable
ALTER TABLE "Faq" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- CreateTable
CREATE TABLE "ScoutPlace" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "dateText" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "participants" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "newsId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ScoutPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoutPlace_isPublished_order_idx" ON "ScoutPlace"("isPublished", "order");

-- AddForeignKey
ALTER TABLE "ScoutPlace" ADD CONSTRAINT "ScoutPlace_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "NewsItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
