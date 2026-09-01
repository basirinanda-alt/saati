import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { SITE_URL } from "./site";
import { TOPIC_PAGES } from "./topics";

/**
 * /quick-checkin and /ikigai were both public, indexable and live for weeks
 * while missing from sitemap.xml. Nothing caught it because nothing checked.
 *
 * These tests pin the invariant rather than the current list: a public page
 * that is not in the sitemap is a bug, and the two that were missing are
 * named explicitly so they cannot quietly fall out again.
 */
describe("sitemap.xml", () => {
  const urls = () => sitemap().map((e) => e.url);

  it("lists every public entry point", () => {
    for (const path of ["/", "/quick-checkin", "/assessment", "/ikigai", "/library", "/methodology", "/privacy"]) {
      expect(urls()).toContain(`${SITE_URL}${path}`);
    }
  });

  it("lists every library topic", () => {
    for (const t of TOPIC_PAGES) expect(urls()).toContain(`${SITE_URL}/library/${t.slug}`);
  });

  it("never lists a private or result URL", () => {
    /* Someone's own reflection must not be handed to a crawler. */
    for (const u of urls()) {
      expect(u).not.toMatch(/\/progress\b/);
      expect(u).not.toMatch(/\/api\//);
      expect(u).not.toMatch(/\/assessment\/[^/]/);
    }
  });

  it("has no duplicates and every URL is absolute", () => {
    const u = urls();
    expect(new Set(u).size).toBe(u.length);
    for (const x of u) expect(x).toMatch(/^https?:\/\//);
  });

  it("does not list anything robots.txt disallows", () => {
    const dis = (robots().rules as { disallow?: string[] }).disallow ?? [];
    for (const u of urls()) {
      const path = u.replace(SITE_URL, "") || "/";
      for (const d of dis) {
        /* An exact-prefix collision is the contradiction Google reports.
           "/assessment/" must not block "/assessment" itself. */
        expect(path.startsWith(d) && path !== d.replace(/\/$/, "")).toBe(false);
      }
    }
  });
});
