-- Additive and non-destructive: existing rows keep their fileUrl and get NULL here.
ALTER TABLE "LibraryResource" ADD COLUMN "oneDriveUrl" TEXT;
