import { useSyncExternalStore } from "react";

/**
 * Lightweight client-only A/B bucketing for on-page experiments. No vendor,
 * no server config, no cookies: a visitor is assigned once per `testId` and
 * the bucket is persisted in localStorage, then travels with the existing
 * app_cta_view / app_cta_click events as `cta_variant` (+ `ab_test`) so GA4
 * Explore can split the funnel by variant (both registered as event-scoped
 * custom dimensions on the Atlantic Buddhist Wellness property, 2026-10-18).
 *
 * Falls back to "control" wherever storage is unavailable (private
 * browsing, blocked, SSR) — an experiment must never break or change the
 * page by itself. Same "control" during SSR/hydration, real bucket on the
 * client, mirroring the detectPlatform pattern in AppDownloadCta/AppShowcase.
 */
export type AbVariant = "control" | "challenger";

const STORAGE_PREFIX = "saati_ab_";

export function assignVariant(testId: string): AbVariant {
  try {
    const key = STORAGE_PREFIX + testId;
    const stored = window.localStorage.getItem(key);
    if (stored === "control" || stored === "challenger") return stored;
    const variant: AbVariant = Math.random() < 0.5 ? "control" : "challenger";
    window.localStorage.setItem(key, variant);
    return variant;
  } catch {
    return "control";
  }
}

const noopSubscribe = () => () => {};

export function useAbVariant(testId: string): AbVariant {
  return useSyncExternalStore<AbVariant>(
    noopSubscribe,
    () => assignVariant(testId),
    () => "control",
  );
}
