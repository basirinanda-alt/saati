import { cookies } from "next/headers";

/**
 * Recognizes a returning student by a long-lived, anonymous, per-browser
 * cookie — no login, no account, no email required. See
 * docs/04-database.md, "Anonymous vs account-linked": this is deliberately
 * the lighter-weight option for V1. It only works on the same
 * browser/device and is lost if cookies are cleared; a real account
 * system would remove that limitation, and is a documented future step
 * (docs/11-roadmap.md), not something silently promised here.
 */
const VISITOR_COOKIE_NAME = "saati_visitor";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/** Reads the visitor token if one exists, without creating one. Safe to
 * call from Server Components (read-only). */
export async function getVisitorToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(VISITOR_COOKIE_NAME)?.value ?? null;
}

/**
 * Reads the visitor token, creating and persisting a new one if this is
 * the student's first visit. Must be called from a Route Handler or
 * Server Action (anywhere cookie writes are allowed) — see
 * app/api/assessments/route.ts.
 */
export async function getOrCreateVisitorToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE_NAME)?.value;
  if (existing) return existing;

  const token = crypto.randomUUID();
  store.set(VISITOR_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  return token;
}
