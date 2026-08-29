/**
 * Addresses go into a real audience list, not into a notification email that
 * stops being read within a week.
 *
 * This is a thin wrapper over `lib/email/audience.ts` rather than a second
 * implementation — one contact-adding code path in the repo, not two. The only
 * thing that differs is the list: ikigai subscribers go to "General", not to
 * the assessment's "Wellbeing Check-in" audience.
 *
 * Resend treats a repeat POST for the same address as a no-op returning the
 * existing contact id, so this needs no exists-check (verified 2026-08-28).
 *
 * Unlike the assessment's version this never swallows the failure: its outcome
 * is returned to the caller and reported. A silently-not-created contact is
 * exactly the failure that hid behind the send-only "Onboarding" key — Resend
 * keeps no dashboard record of a rejected contact call, so nothing anywhere
 * said so.
 */

import { addContactToAudience } from "@/lib/email/audience";

/** "General" — see Brand/Resend_API_Credentials.md. */
const IKIGAI_AUDIENCE_ID =
  process.env.IKIGAI_RESEND_AUDIENCE_ID ||
  "1ee71dab-7a25-4a22-b3de-a6fdc43badab";

export interface ContactResult {
  added: boolean;
  error?: string;
}

export async function addContact(
  email: string,
  firstName: string,
): Promise<ContactResult> {
  const result = await addContactToAudience(email, {
    audienceId: IKIGAI_AUDIENCE_ID,
    firstName: firstName || undefined,
  });
  return { added: result.success, error: result.error };
}
