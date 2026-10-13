-- AlterTable
ALTER TABLE "OrgNode" ADD COLUMN     "ageRange" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "meetingDay" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "meetingLocation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "meetingTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "section" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "OrgAssignment" ADD COLUMN     "contactEmail" TEXT NOT NULL DEFAULT '';

-- Data: move each unit's weekly meeting and age range from the free-text
-- schedule onto the unit itself. Schedule rows were typed as
-- «<unit name> — <section>», e.g. «قطيع الكوالا — الأشبال (ذكور)».
UPDATE "OrgNode" AS n SET
  "section" = CASE
    WHEN strpos(j."stage", ' — ') > 0
      THEN btrim(substr(j."stage", strpos(j."stage", ' — ') + 3))
    ELSE ''
  END,
  "ageRange" = btrim(j."ageRange"),
  "meetingDay" = btrim(j."day"),
  "meetingTime" = btrim(j."time"),
  "meetingLocation" = btrim(j."location")
FROM "JoinSchedule" AS j
WHERE n."kind" = 'unit'
  AND btrim(split_part(j."stage", ' — ', 1)) = btrim(n."title");

-- Data: public contact addresses of the troop leader and the secretary roles.
UPDATE "OrgAssignment" SET "contactEmail" = 'chief@rawdamuslimscout.org'
WHERE btrim("title") IN ('عميد الفوج', 'قائد الفوج');

UPDATE "OrgAssignment" SET "contactEmail" = 'secretary@rawdamuslimscout.org'
WHERE btrim("title") IN ('أمين السر', 'أمين سر الفوج');
