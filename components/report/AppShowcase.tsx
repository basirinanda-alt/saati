"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectPlatform,
  type AppPlatform,
} from "@/lib/appLinks";
import { trackEvent, type QuizName } from "@/lib/analytics/gtag";

const ROTATE_MS = 4000;

const SLIDES = [
  {
    src: "/app-shots/who5-journal.jpg",
    width: 480,
    height: 1043,
    alt: "Saati app Journal showing a WHO-5 well-being score out of 100 for the last two weeks",
    tag: "WHO-5",
    heading: "Your WHO-5, every two weeks",
    body: "The same five questions you just answered, tracked in your Journal so you can see the trend, not one snapshot.",
  },
  {
    src: "/app-shots/checkins-journal.jpg",
    width: 480,
    height: 1040,
    alt: "Saati app Journal tiles for conversations, Find a Way plans, Ikigai reflections, well-being check-ins and PERMA reports",
    tag: "PERMA",
    heading: "Every check-in kept in one place",
    body: "Well-being check-ins and monthly PERMA reports sit beside your conversations and plans. Only you can see them.",
  },
  {
    src: "/app-shots/care-checkin.jpg",
    width: 480,
    height: 1043,
    alt: "Saati app Care library with the WHO-5 Well-Being Check-In card",
    tag: "Care",
    heading: "Check in again whenever you like",
    body: "The Well-Being Check-In lives in Care, next to guided practices like Body Scan and Find a Way.",
  },
] as const;

const noopSubscribe = () => () => {};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

interface AppShowcaseProps {
  quiz: QuizName;
}

/**
 * Top-of-results app showcase (2026-10-06): a phone frame that crossfades
 * through three real app screens, showing that the check-in the student
 * just took carries on in the app.
 *
 * Carousel behaviour follows the WAI-ARIA carousel pattern: a visible
 * Pause/Play control, rotation paused while the pointer or keyboard focus
 * is inside, no autoplay under prefers-reduced-motion, and the caption is
 * only a live region while rotation is stopped — so a slide the student
 * picks is announced, but nothing is read out every four seconds.
 *
 * Store clicks fire the same `app_cta_click` event as AppDownloadCta, with
 * `app_placement: "showcase"` added so the two placements can be told
 * apart without changing the `store` / `app_source` dimensions. Hidden in
 * print: the PDF export is a print of this page (lib/pdf/render.ts).
 */
export function AppShowcase({ quiz }: AppShowcaseProps) {
  const platform = useSyncExternalStore<AppPlatform>(
    noopSubscribe,
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => "desktop",
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  const [current, setCurrent] = useState(0);
  // null = the student hasn't chosen; follow the reduced-motion setting.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const paused = userPaused ?? reducedMotion;
  const rotating = !paused && !hovered && !focused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(
      () => setCurrent((i) => (i + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [rotating, current]);

  function onStoreClick(store: "ios" | "android") {
    trackEvent("app_cta_click", {
      store,
      transport_type: "beacon",
      app_source: quiz,
      app_platform: platform,
      app_placement: "showcase",
    });
  }

  const slide = SLIDES[current];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What the Saati app keeps for you"
      // Mouse only: a tap on a phone fires pointerenter with no matching
      // leave, which would stop rotation for good.
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          setFocused(false);
      }}
      className="relative mb-6 grid items-center justify-items-center gap-6 overflow-hidden rounded-[28px] border border-(--r-line) bg-linear-150 from-(--r-card) to-(--r-bg) px-5 py-7 text-center min-[560px]:grid-cols-[auto_1fr] min-[560px]:justify-items-stretch min-[560px]:px-6 min-[560px]:text-left print:hidden"
    >
      {/* One faint accent glow — deliberately not a second colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -left-14 h-60 w-60 rounded-full bg-(--r-glow) blur-[40px]"
      />

      <div className="relative aspect-[9/19.5] w-[190px] rounded-[34px] bg-[#121212] p-2 shadow-[0_24px_50px_rgba(20,30,30,0.28),inset_0_0_0_2px_#2b2b2b] min-[560px]:w-[200px]">
        <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-neutral-100">
          {SLIDES.map((s, i) => (
            <Image
              key={s.src}
              src={s.src}
              width={s.width}
              height={s.height}
              sizes="200px"
              alt={s.alt}
              aria-hidden={i !== current}
              priority={i === 0}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
                i === current
                  ? "scale-100 opacity-100"
                  : "scale-[1.04] opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col items-center gap-3 min-[560px]:items-start">
        <p className="text-xs font-bold tracking-[0.16em] text-(--r-accent-ink) uppercase">
          Your check-in doesn&rsquo;t end here
        </p>
        <h2 className="text-2xl leading-tight font-semibold text-balance text-(--r-ink)">
          Watch your wellbeing change over time
        </h2>

        <div
          aria-live={rotating ? "off" : "polite"}
          aria-atomic="true"
          className="min-h-24"
        >
          <span className="mb-2 inline-block rounded-full bg-(--r-glow) px-2.5 py-1 text-[0.7rem] font-bold tracking-[0.12em] text-(--r-accent-ink) uppercase">
            {slide.tag}
          </span>
          <h3 className="mb-1 text-base font-bold text-(--r-ink)">
            {slide.heading}
          </h3>
          <p className="text-sm text-(--r-soft)">{slide.body}</p>
        </div>

        <div className="flex items-center gap-3">
          <div role="group" aria-label="Choose a screen" className="flex">
            {SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                aria-label={`Show screen ${i + 1}: ${s.heading}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setCurrent(i)}
                className="group flex h-6 min-w-6 items-center justify-center rounded-full px-1 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--r-accent)"
              >
                <span
                  className={`block h-2.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                    i === current
                      ? "w-7 bg-(--r-ink)"
                      : "w-2.5 bg-(--r-line) group-hover:bg-(--r-soft)"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            className="min-h-6 rounded-full border border-(--r-line) px-2.5 py-1 text-xs font-semibold text-(--r-soft) hover:text-(--r-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--r-accent)"
          >
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> screen rotation</span>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-2.5 min-[560px]:justify-start">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={() => onStoreClick("ios")}
            aria-label="Download Saati on the App Store"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-[#a6a6a6] bg-black py-2 pr-4 pl-3 text-white transition-transform hover:-translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--r-accent) motion-reduce:transition-none"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6 flex-none"
            >
              <path
                fill="#fff"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              />
            </svg>
            <span className="flex flex-col text-left leading-[1.1]">
              <small className="text-[0.62rem] tracking-[0.02em]">
                Download on the
              </small>
              <b className="text-[1.05rem] font-semibold tracking-[-0.01em]">
                App Store
              </b>
            </span>
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={() => onStoreClick("android")}
            aria-label="Get Saati on Google Play"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-[#a6a6a6] bg-black py-2 pr-4 pl-3 text-white transition-transform hover:-translate-y-px focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--r-accent) motion-reduce:transition-none"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-6 w-6 flex-none"
            >
              <path fill="#00C3FF" d="M4 2.5 13.4 12 4 21.5z" />
              <path fill="#00E676" d="M4 2.5l12.6 6.8-3.2 2.7z" />
              <path fill="#FF3A44" d="M4 21.5l9.4-9.5 3.2 2.7z" />
              <path
                fill="#FFD500"
                d="M16.6 9.3l4 2.1c.8.4.8 1 0 1.3l-4 2-3.2-2.7z"
              />
            </svg>
            <span className="flex flex-col text-left leading-[1.1]">
              <small className="text-[0.62rem] tracking-[0.02em]">
                GET IT ON
              </small>
              <b className="text-[1.05rem] font-semibold tracking-[-0.01em]">
                Google Play
              </b>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
