/**
 * Country-specific crisis lines and prevalence figures for the anxiety test.
 * Checked 2026-10-13. Re-verify numbers before each release; a wrong
 * helpline is worse than none. Figures use different definitions in each
 * country, so never compare them with each other on the page.
 */

export type Region = "US" | "CA" | "GB" | "AU" | "OTHER";

export const REGION_LABELS: Record<Region, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AU: "Australia",
  OTHER: "Somewhere else",
};

export interface CrisisLine {
  name: string;
  contact: string;
  /** tel: or sms: href; omitted for chat/web-only lines */
  href?: string;
  note: string;
}

export const CRISIS: Record<Region, CrisisLine[]> = {
  US: [
    { name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", href: "tel:988", note: "Free, 24/7, for any kind of emotional distress." },
    { name: "Emergency", contact: "911", href: "tel:911", note: "If you or someone else is in immediate danger." },
  ],
  CA: [
    { name: "9-8-8 Suicide Crisis Helpline", contact: "Call or text 988", href: "tel:988", note: "Free, 24/7, in English and French." },
    { name: "Emergency", contact: "911", href: "tel:911", note: "If you or someone else is in immediate danger." },
  ],
  GB: [
    { name: "Samaritans", contact: "116 123", href: "tel:116123", note: "Free, 24/7, to talk about anything." },
    { name: "NHS 111", contact: "111, option 2", href: "tel:111", note: "For urgent mental health help in England." },
    { name: "Emergency", contact: "999", href: "tel:999", note: "If you or someone else is in immediate danger." },
  ],
  AU: [
    { name: "Lifeline", contact: "13 11 14, or text 0477 13 11 14", href: "tel:131114", note: "Free, 24/7 crisis support." },
    { name: "Emergency", contact: "000", href: "tel:000", note: "If you or someone else is in immediate danger." },
  ],
  OTHER: [
    { name: "Emergency", contact: "Your local emergency number", note: "If you or someone else is in immediate danger, or contact a local crisis line." },
  ],
};

export const PREVALENCE: Record<Region, { text: string; source: string; url: string } | null> = {
  US: {
    text: "About 1 in 6 US adults (15.6%) had mild, moderate or severe anxiety symptoms over a two-week period, measured with this same GAD-7.",
    source: "CDC, National Health Interview Survey 2019",
    url: "https://www.cdc.gov/nchs/products/databriefs/db378.htm",
  },
  CA: {
    text: "In 2022, 5.2% of Canadians aged 15 and older met the criteria for generalized anxiety disorder, double the rate in 2012.",
    source: "Statistics Canada, Mental Health and Access to Care Survey",
    url: "https://www150.statcan.gc.ca/n1/daily-quotidien/230922/dq230922b-eng.htm",
  },
  GB: {
    text: "About 1 in 12 adults in England (7.5%) had generalised anxiety disorder in 2023/24.",
    source: "Adult Psychiatric Morbidity Survey 2023/24",
    url: "https://www.citystgeorges.ac.uk/news-and-events/news/2025/june/adult-psychiatric-morbidity-survey",
  },
  AU: {
    text: "About 1 in 6 Australians aged 16 to 85 (17.2%) had an anxiety disorder in the past year.",
    source: "Australian Bureau of Statistics, 2020–22",
    url: "https://www.abs.gov.au/media-centre/media-releases/two-five-australians-have-experienced-mental-disorder",
  },
  OTHER: null,
};

export function regionFromCountry(code: string | null | undefined): Region {
  const c = (code || "").toUpperCase();
  if (c === "US" || c === "CA" || c === "AU") return c;
  if (c === "GB" || c === "UK") return "GB";
  return "OTHER";
}
