-- Applied via `prisma db push` (purely additive: new table + FK, no
-- existing column/constraint changes, so no data-loss confirmation was
-- required). Recorded here so migration history stays accurate.

CREATE TABLE "insight_scores" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "scoringAlgorithmVersion" TEXT NOT NULL DEFAULT 'v1',
    "rawScore" DOUBLE PRECISION NOT NULL,
    "percentageScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insight_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "insight_scores_sessionId_module_key" ON "insight_scores"("sessionId", "module");
CREATE INDEX "insight_scores_sessionId_idx" ON "insight_scores"("sessionId");

ALTER TABLE "insight_scores" ADD CONSTRAINT "insight_scores_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "assessment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
