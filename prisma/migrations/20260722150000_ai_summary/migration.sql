-- Applied via `prisma db push` (purely additive: two new nullable columns,
-- no data-loss confirmation required). Recorded here for migration history.

ALTER TABLE "assessment_sessions" ADD COLUMN "aiSummary" TEXT;
ALTER TABLE "assessment_sessions" ADD COLUMN "aiSummarySource" TEXT;
