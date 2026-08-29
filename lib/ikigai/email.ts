/**
 * The ONE code path that sends the ikigai results email.
 *
 * It reports what actually happened. Callers must not tell a person their
 * results were emailed unless `sent` is true — the on-screen confirmation is
 * rendered off this result, never off the fact that an attempt was made.
 */

import { Resend } from "resend";
import {
  CIRCLE_KEYS,
  CIRCLE_LABELS,
  type IkigaiResult,
} from "./reflection";

const SEND_TIMEOUT_MS = 8_000;

/**
 * Never default to a provider's shared test sender. Resend's
 * `onboarding@resend.dev` is rejected at the API boundary for every recipient
 * except the account owner, so the failures never reach the dashboard and an
 * empty log reads as "no traffic" rather than "everything failed". That hid a
 * real outage in this codebase for five weeks — see lib/email/send.ts.
 * `saati.ai` is a verified sending domain.
 */
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "hello@saati.ai";
const ADMIN_ADDRESS = process.env.ADMIN_NOTIFICATION_EMAIL || "info@saati.ca";

export interface SendResult {
  sent: boolean;
  error?: string;
}

export function buildEmailText(
  greetingName: string,
  result: IkigaiResult,
): string {
  const circleBlock = CIRCLE_KEYS.map(
    (k) => `${CIRCLE_LABELS[k]}\n  ${result.circles[k]}\n`,
  ).join("\n");

  return (
    `Hi ${greetingName},\n\n` +
    `Thank you for taking a few quiet minutes for yourself. Here is what you wrote back to you.\n\n` +
    `AT THE CENTRE\n  ${result.centre}\n\n` +
    `YOUR FOUR CIRCLES\n\n${circleBlock}\n` +
    `THE THREAD RUNNING THROUGH IT\n  ${result.thread}\n\n` +
    `  If that doesn't sound like you, trust yourself over the page. You know your life\n` +
    `  better than four questions ever could.\n\n` +
    `ONE SMALL STEP THIS WEEK\n  ${result.step}\n\n` +
    `─────────────────────────────────────────────\n\n` +
    `Noticing the thread is one thing. Keeping hold of it through an ordinary week is another.\n` +
    `That is what Saati is built for — a companion that remembers what matters to you, checks in\n` +
    `without nagging, and helps you take the next small step. You can read more at https://saati.ca\n\n` +
    `With warmth,\nSaati — a companion for life's quieter moments\nhttps://saati.ca\n\n` +
    `This is a reflection, not a diagnosis. Saati is a wellbeing companion, not a therapist or\n` +
    `medical service. In Canada you can call or text 9-8-8 any time if you need to talk to someone.\n`
  );
}

async function send(
  to: string,
  subject: string,
  text: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const error = "RESEND_API_KEY is not set; no email can be sent.";
    console.error(`ikigai: ${error}`);
    return { sent: false, error };
  }

  const timeout = new Promise<SendResult>((resolve) =>
    setTimeout(
      () => resolve({ sent: false, error: "Email provider timed out." }),
      SEND_TIMEOUT_MS,
    ),
  );

  const attempt = (async (): Promise<SendResult> => {
    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: `Saati <${FROM_ADDRESS}>`,
        to,
        subject,
        text,
      });
      if (error) {
        console.error("ikigai: Resend returned an error:", error);
        return { sent: false, error: error.message ?? "Resend rejected the send." };
      }
      return { sent: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : "Email send threw.";
      console.error("ikigai: email send threw:", e);
      return { sent: false, error };
    }
  })();

  return Promise.race([attempt, timeout]);
}

/**
 * Sends the participant their results and the founder a copy. Only the
 * participant's send determines `sent` — an admin-copy failure must not tell
 * someone their own email failed. Both go out concurrently.
 */
export async function sendResults(
  to: string,
  name: string,
  result: IkigaiResult,
  meta: { ageBand: string; source: string; contactAdded: boolean; contactError?: string },
): Promise<SendResult> {
  const text = buildEmailText(name || "there", result);

  const adminBody =
    `Name: ${name || "(not given)"}\n` +
    `Email: ${to}\n` +
    `Age band: ${meta.ageBand}\n` +
    `Reflection source: ${meta.source}\n` +
    `Added to audience: ${meta.contactAdded ? "yes" : `NO — ${meta.contactError ?? "unknown"}`}\n\n` +
    text;

  const [participant] = await Promise.all([
    send(to, "Your ikigai — what you told us", text),
    send(ADMIN_ADDRESS, `New ikigai reflection: ${to}`, adminBody),
  ]);

  return participant;
}

/**
 * Crisis notification to the founder. Fixed text, never model-generated, and
 * never sent to the participant.
 */
export async function sendCrisisAlert(
  email: string,
  name: string,
  ageBand: string,
  answers: Record<string, string>,
): Promise<SendResult> {
  const body =
    `A submission tripped the crisis keyword screen.\n\n` +
    `Email: ${email || "(not given — results were shown before any address was asked for)"}\n` +
    `Name: ${name || "(not given)"}\n` +
    `Age band: ${ageBand}\n\n` +
    `The participant was shown 9-8-8 immediately, was not asked for an email, and was sent nothing.\n\n` +
    CIRCLE_KEYS.map((k) => `${CIRCLE_LABELS[k]}: ${answers[k] ?? ""}`).join("\n");

  return send(ADMIN_ADDRESS, `[CRISIS FLAG] Ikigai submission`, body);
}
