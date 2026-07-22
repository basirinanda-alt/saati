-- Applied via `prisma db push` (relaxes a unique constraint on an
-- essentially empty dev table; no data-loss confirmation was required).
-- Recorded here so migration history stays accurate.

DROP INDEX IF EXISTS "assessment_sessions_anonymousToken_key";
CREATE INDEX "assessment_sessions_anonymousToken_createdAt_idx"
  ON "assessment_sessions"("anonymousToken", "createdAt");
