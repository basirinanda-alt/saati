-- The email is now collected AFTER results are shown, not before, so a
-- completed session may legitimately have no email yet. This reverses the
-- 2026-07-22 "required email" decision recorded in
-- 20260722180000_required_email.
--
-- Widening NOT NULL -> NULL only, so no existing row is affected and the
-- change is backward compatible with rows written by the previous build.

ALTER TABLE "assessment_sessions" ALTER COLUMN "email" DROP NOT NULL;
