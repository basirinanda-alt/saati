-- Applied via `prisma db push` against an empty dev table (adding a
-- required column with no default), so no data-loss confirmation was
-- required. Recorded here for migration history.

ALTER TABLE "assessment_sessions" ADD COLUMN "email" TEXT NOT NULL;
ALTER TABLE "assessment_sessions" ADD COLUMN "emailSentAt" TIMESTAMP(3);

CREATE INDEX "assessment_sessions_email_idx" ON "assessment_sessions"("email");
