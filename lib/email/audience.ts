import { Resend } from "resend";

/**
 * Adds a student's address to the Resend audience, quietly.
 *
 * This replaces the per-submission notification email that used to go to
 * info@saati.ca (2026-08-28): a message on every completed check-in is
 * noise that stops being read, whereas an audience is a list you can
 * actually send a campaign to later.
 *
 * Resend treats a repeat POST for the same address as a no-op and returns
 * the existing contact id, so this needs no exists-check and is safe to
 * call more than once for the same student.
 */
const AUDIENCE_ID =
  process.env.RESEND_AUDIENCE_ID || "622703ff-37fe-4737-9877-8c78bb64640a";

export interface AddContactResult {
  success: boolean;
  error?: string;
}

export async function addContactToAudience(
  email: string,
): Promise<AddContactResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set; cannot record contact.");
    return { success: false, error: "Contact collection is not configured." };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      // Never pre-marked as unsubscribed: the student entered this address
      // to receive their report, and Resend's own unsubscribe link is what
      // moves them out of the audience later.
      unsubscribed: false,
    });

    if (error) {
      console.error("Resend returned an error adding a contact:", error);
      return { success: false, error: "Could not record contact." };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to add contact to audience:", error);
    return { success: false, error: "Could not record contact." };
  }
}
