// The Saati app's store listings. One copy for the whole Next.js app (the
// results page CTA and the results email both read it). The static Ikigai
// page in public/ikigai/ carries its own copy in its SAATI_APP block — keep
// the two in sync.
export const APP_STORE_URL = "https://apps.apple.com/ca/app/saati-ai/id6790037807";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=org.atlantictheravada.saati";

export type AppPlatform = "ios" | "android" | "desktop";

export function detectPlatform(userAgent: string, maxTouchPoints = 0): AppPlatform {
  if (/iPhone|iPad|iPod/.test(userAgent)) return "ios";
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "desktop";
}
