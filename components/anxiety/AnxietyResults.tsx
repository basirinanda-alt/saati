"use client";

import { useState } from "react";
import { downloadUrlFor, detectPlatform } from "@/lib/appLinks";
import { trackEvent } from "@/lib/analytics/gtag";
import { GAD7_ATTRIBUTION, GAD7_BAND_LABELS, scoreGad7, type Gad7Band } from "@/lib/anxiety/gad7";
import { buildStory, recommend, scorePatterns, type ProfileAnswers } from "@/lib/anxiety/profile";
import { CRISIS, PREVALENCE, REGION_LABELS, type Region } from "@/lib/anxiety/regions";

const BAND_TEXT: Record<Gad7Band, string> = {
  minimal: "Your answers suggest little anxiety over the last two weeks. That's good to know, and worth protecting.",
  mild: "Your answers suggest some anxiety, the kind many people carry day to day. It's worth keeping an eye on, and small daily habits can make a real difference.",
  moderate: "Your answers suggest anxiety at a level worth taking seriously. A score of 10 or more is where doctors usually suggest talking it through.",
  severe: "Your answers suggest a lot of anxiety right now. That's hard to carry, and you don't have to carry it alone.",
};

const DOCTOR_NOTE: Record<Region, string> = {
  US: "Your primary care doctor is a good first step.",
  CA: "Your family doctor or a walk-in clinic is a good first step.",
  GB: "Your GP is a good first step. In England you can also refer yourself to NHS Talking Therapies, which is free.",
  AU: "Your GP is a good first step. They can set up a Mental Health Treatment Plan, which gives you Medicare-subsidised sessions with a psychologist.",
  OTHER: "A family doctor or local health service is a good first step.",
};

// The GAD-7 bar: 0–21 split at the published cut-offs.
const SEGMENTS: { band: Gad7Band; from: number; to: number }[] = [
  { band: "minimal", from: 0, to: 5 },
  { band: "mild", from: 5, to: 10 },
  { band: "moderate", from: 10, to: 15 },
  { band: "severe", from: 15, to: 22 },
];

interface Props {
  headingRef: (n: HTMLElement | null) => void;
  gad: number[];
  difficulty: number;
  profile: ProfileAnswers;
  initialRegion: Region;
  onRetake: () => void;
}

export function AnxietyResults({ headingRef, gad, difficulty, profile, initialRegion, onRetake }: Props) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const { total, band } = scoreGad7(gad);
  const scores = scorePatterns(profile.scenes);
  const story = buildStory(profile, scores);
  const rec = recommend(profile, scores);
  const prevalence = PREVALENCE[region];
  const seeDoctor = total >= 10 || difficulty >= 2;
  // Reach for support first, before anything else on the page, when the
  // score is severe or the "something awful" item is answered strongly.
  const supportFirst = band === "severe" || gad[6] >= 2;
  // A generic tag only: the loudest pattern is health information and must
  // not travel in a URL that analytics could record as an outbound click.
  const downloadUrl = downloadUrlFor("anxiety_test");

  function onCta() {
    trackEvent("app_cta_click", {
      store: detectPlatform(navigator.userAgent, navigator.maxTouchPoints) === "desktop" ? "site" : detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
      transport_type: "beacon",
      app_source: "anxiety",
      app_placement: "results_cta",
    });
  }

  const crisisCard = (
    <section aria-labelledby="crisis-heading" className="rounded-2xl border border-(--r-line) bg-(--r-card) p-6">
      <h2 id="crisis-heading" className="text-base font-semibold text-(--r-ink)">
        If you need someone right now
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {CRISIS[region].map((c) => (
          <li key={c.name} className="text-sm text-(--r-soft)">
            <span className="font-semibold text-(--r-ink)">{c.name}: </span>
            {c.href ? (
              <a href={c.href} className="font-semibold text-(--c-accent-ink) underline underline-offset-2">
                {c.contact}
              </a>
            ) : (
              <span className="font-semibold text-(--r-ink)">{c.contact}</span>
            )}
            . {c.note}
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="report-theme flex-1">
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12">
        <header>
          <p className="text-xs font-semibold tracking-wide text-(--r-accent-ink) uppercase">Your anxiety test results</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-3xl font-semibold text-balance text-(--r-ink) outline-none">
            {story.headline}
          </h1>
        </header>

        {supportFirst && (
          <section className="calm-fade rounded-3xl border-2 border-(--c-accent) bg-(--r-card) p-6">
            <h2 className="text-lg font-semibold text-(--r-ink)">Before anything else</h2>
            <p className="mt-2 text-sm text-(--r-soft)">
              Your answers suggest you&rsquo;re carrying a lot right now. Please talk to a doctor soon. {DOCTOR_NOTE[region]} If it
              ever feels like too much, reach out to someone today:
            </p>
            <div className="mt-4">{crisisCard}</div>
          </section>
        )}

        {/* The aha moment: their own answers, said back to them. */}
        <section aria-label="Your anxiety, in your words" className="rounded-[22px] border border-(--r-line) bg-(--r-card) p-6 shadow-[0_18px_50px_rgba(61,103,88,0.08)] sm:p-8">
          <p className="text-lg leading-relaxed text-(--r-ink)">{story.lead}</p>
          {story.quote && (
            <blockquote className="mt-4 border-l-4 border-(--c-accent) py-1 pl-4 text-lg text-(--r-ink) italic">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
          )}
          <p className="mt-4 leading-relaxed text-(--r-soft)">{story.normalise}</p>
          {story.quiet && <p className="mt-3 leading-relaxed text-(--r-soft)">{story.quiet}</p>}
        </section>

        <section aria-labelledby="map-heading" className="rounded-[22px] border border-(--r-line) bg-(--r-card) p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="map-heading" className="text-lg font-semibold text-(--r-ink)">Your anxiety map</h2>
            <span className="text-xs text-(--r-soft)">Saati Insights · a guide, not a clinical measure</span>
          </div>
          <ul className="mt-5 flex flex-col gap-4">
            {[...scores].sort((a, b) => b.level - a.level).map((s) => {
              const loudest = s.key === story.top.key && s.level >= 34;
              return (
                <li key={s.key}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className={loudest ? "font-semibold text-(--r-ink)" : "text-(--r-soft)"}>{s.label}</span>
                    <span className="text-(--r-soft) tabular-nums">
                      {s.level >= 75 ? "Loud" : s.level >= 50 ? "Present" : s.level > 16 ? "A little" : "Quiet"}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-(--r-track)">
                    <div
                      className={`h-full rounded-full ${loudest ? "bg-(--c-accent)" : "bg-(--c-accent) opacity-45"}`}
                      style={{ width: `${Math.max(s.level, 3)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="gad-heading" className="rounded-[22px] border border-(--r-line) bg-(--r-card) p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-(--r-accent-ink) uppercase">Validated measure · GAD-7</p>
          <h2 id="gad-heading" className="mt-2 text-2xl font-semibold text-(--r-ink)">
            {total} out of 21 <span className="text-(--r-soft)">·</span> {GAD7_BAND_LABELS[band]}
          </h2>
          <div className="mt-4 flex gap-1" aria-hidden="true">
            {SEGMENTS.map((seg) => (
              <div key={seg.band} className="flex-1" style={{ flexGrow: seg.to - seg.from }}>
                <div className={`h-2.5 rounded-full ${seg.band === band ? "bg-(--c-accent)" : "bg-(--r-track)"}`} />
                <p className={`mt-1 text-[0.7rem] ${seg.band === band ? "font-semibold text-(--r-ink)" : "text-(--r-soft)"}`}>
                  {seg.band[0].toUpperCase() + seg.band.slice(1)}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 leading-relaxed text-(--r-soft)">{BAND_TEXT[band]}</p>
          {seeDoctor && !supportFirst && (
            <p className="mt-3 leading-relaxed text-(--r-ink)">
              <strong>Worth talking to a doctor.</strong> {DOCTOR_NOTE[region]} You could show them this score.
            </p>
          )}
          <p className="mt-4 text-xs text-(--r-soft)">
            The GAD-7 is the same questionnaire used by NHS Talking Therapies in England and by Mental Health America. A score
            is a starting point for a conversation, not a diagnosis.
          </p>
        </section>

        <section aria-labelledby="alone-heading" className="rounded-[22px] border border-(--r-line) bg-(--r-card) p-6 sm:p-8">
          <h2 id="alone-heading" className="text-lg font-semibold text-(--r-ink)">You&rsquo;re far from alone</h2>
          {prevalence ? (
            <p className="mt-2 leading-relaxed text-(--r-soft)">
              {prevalence.text}{" "}
              <a href={prevalence.url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2">
                {prevalence.source}
              </a>
            </p>
          ) : (
            <p className="mt-2 leading-relaxed text-(--r-soft)">
              Anxiety is one of the most common things people live with, in every country.
            </p>
          )}
          <label className="mt-4 flex flex-wrap items-center gap-2 text-xs text-(--r-soft)">
            Showing figures and help lines for
            <select
              id="anxiety-region"
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="rounded-md border border-(--r-line) bg-(--r-card) px-2 py-1 text-(--r-ink)"
            >
              {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
                <option key={r} value={r}>{REGION_LABELS[r]}</option>
              ))}
            </select>
          </label>
        </section>

        <section aria-labelledby="next-heading" className="rounded-[22px] border border-(--c-accent)/30 bg-(--c-tint) p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-wide text-(--r-accent-ink) uppercase">Your next step</p>
          <h2 id="next-heading" className="mt-2 text-xl font-semibold text-balance text-(--r-ink)">{rec.step}</h2>
          <p className="mt-3 leading-relaxed text-(--r-soft)">{rec.why}</p>
          <p className="mt-3 leading-relaxed text-(--r-ink)">{rec.saatiHelp}</p>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener"
            onClick={onCta}
            className="calm-button mt-5 w-full sm:w-auto"
          >
            {rec.buttonLabel}
          </a>
          <p className="mt-2 text-xs text-(--r-soft)">Free download for iPhone and Android.</p>
        </section>

        {!supportFirst && crisisCard}

        <footer className="flex flex-col gap-3 text-xs text-(--r-soft)">
          <p>
            This test can&rsquo;t diagnose anxiety; only a health professional can. Saati is a wellbeing companion, not a
            medical service, therapy, or crisis support. Your answers stayed in your browser and were not saved.
          </p>
          <p>{GAD7_ATTRIBUTION}</p>
          <button type="button" onClick={onRetake} className="self-start text-sm font-medium text-(--c-accent-ink) underline underline-offset-2">
            Take the test again
          </button>
        </footer>
      </main>
    </div>
  );
}
