/**
 * The small, outlined store-badge pair the "challenger" arm of
 * cta_visual_weight_v1 adds under the main CTA button (AppDownloadCta,
 * AnxietyResults). Same download link as the button above it — this isn't
 * a second destination, just a second, more literal way to notice it.
 * Secondary in weight on purpose: outlined, not filled, so the button above
 * stays the one primary action. See lib/analytics/abTest.ts.
 */
export function StoreMiniBadges({
  downloadUrl,
  onClick,
}: {
  downloadUrl: string;
  onClick: (store: "ios" | "android") => void;
}) {
  return (
    <div className="store-mini-badges">
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener"
        onClick={() => onClick("ios")}
        aria-label="Download Saati on the App Store"
        className="store-mini-badge"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
          />
        </svg>
        App Store
      </a>
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener"
        onClick={() => onClick("android")}
        aria-label="Get Saati on Google Play"
        className="store-mini-badge"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#00C3FF" d="M4 2.5 13.4 12 4 21.5z" />
          <path fill="#00E676" d="M4 2.5l12.6 6.8-3.2 2.7z" />
          <path fill="#FF3A44" d="M4 21.5l9.4-9.5 3.2 2.7z" />
          <path fill="#FFD500" d="M16.6 9.3l4 2.1c.8.4.8 1 0 1.3l-4 2-3.2-2.7z" />
        </svg>
        Google Play
      </a>
    </div>
  );
}
