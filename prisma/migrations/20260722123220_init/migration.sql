-- CreateTable
CREATE TABLE "assessment_sessions" (
    "id" TEXT NOT NULL,
    "anonymousToken" TEXT NOT NULL,
    "questionSetVersion" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "assessment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_responses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validated_scores" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "scoringAlgorithmVersion" TEXT NOT NULL DEFAULT 'v1',
    "rawScore" INTEGER NOT NULL,
    "percentageScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validated_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_sessions_anonymousToken_key" ON "assessment_sessions"("anonymousToken");

-- CreateIndex
CREATE INDEX "question_responses_sessionId_idx" ON "question_responses"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "question_responses_sessionId_instrument_questionKey_key" ON "question_responses"("sessionId", "instrument", "questionKey");

-- CreateIndex
CREATE INDEX "validated_scores_sessionId_idx" ON "validated_scores"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "validated_scores_sessionId_instrument_key" ON "validated_scores"("sessionId", "instrument");

-- AddForeignKey
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validated_scores" ADD CONSTRAINT "validated_scores_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
