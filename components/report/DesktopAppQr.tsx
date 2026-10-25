"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { detectPlatform, type AppPlatform } from "@/lib/appLinks";

const noopSubscribe = () => () => {};

/**
 * A scan-to-download QR code under the results CTA, for computer visitors
 * only (2026-10-25): ~80% of quiz traffic was on desktop, where the store
 * button can't install anything. The code points at the same tracked
 * redirector as the button, which sends a phone on to its own store, so
 * one code covers iPhone and Android. Scans arrive tagged
 * utm_content=qr_<content> so they can be told apart from button clicks.
 *
 * Renders nothing on the server and during hydration ("unknown"), so a
 * phone never flashes a QR code it can't scan.
 */
export function DesktopAppQr({ url }: { url: string }) {
  const platform = useSyncExternalStore<AppPlatform | "unknown">(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => "unknown",
  );
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (platform !== "desktop") return;
    let cancelled = false;
    QRCode.toString(url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1F3D33", light: "#FFFFFF" },
    }).then((s) => {
      if (!cancelled) setSvg(s);
    });
    return () => {
      cancelled = true;
    };
  }, [platform, url]);

  if (platform !== "desktop" || !svg) return null;

  return (
    <div className="mt-5 flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700">
      <div
        role="img"
        aria-label="QR code to download Saati on your phone"
        className="h-28 w-28 shrink-0 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="text-sm text-neutral-800">
        <p className="font-semibold text-neutral-900">On a computer? Scan with your phone.</p>
        <p className="mt-1 text-neutral-600">
          Point your phone&rsquo;s camera here to get Saati free on iPhone or Android.
        </p>
      </div>
    </div>
  );
}
