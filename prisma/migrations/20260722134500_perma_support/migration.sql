-- Applied via `prisma db push` (see project history for context: this dev
-- database had zero rows in validated_scores at the time). Recorded here
-- so migration history stays accurate for future `prisma migrate deploy`.

-- Add multi-domain support (PERMA has several sub-scores per session;
-- WHO-5 uses domain = 'total').
ALTER TABLE "validated_scores" ADD COLUMN "domain" TEXT;
UPDATE "validated_scores" SET "domain" = 'total' WHERE "domain" IS NULL;
ALTER TABLE "validated_scores" ALTER COLUMN "domain" SET NOT NULL;

-- Native-scale and normalized scores can be fractional (PERMA domain means).
ALTER TABLE "validated_scores" ALTER COLUMN "rawScore" TYPE DOUBLE PRECISION;
ALTER TABLE "validated_scores" ALTER COLUMN "percentageScore" TYPE DOUBLE PRECISION;

-- Replace the old (sessionId, instrument) uniqueness with
-- (sessionId, instrument, domain), since one instrument can now have
-- several scored domains per session.
DROP INDEX IF EXISTS "validated_scores_sessionId_instrument_key";
CREATE UNIQUE INDEX "validated_scores_sessionId_instrument_domain_key"
  ON "validated_scores"("sessionId", "instrument", "domain");
