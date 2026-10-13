import type { Metadata } from "next";
import { headers } from "next/headers";
import { AnxietyTest } from "@/components/anxiety/AnxietyTest";
import { JsonLd } from "@/components/seo/JsonLd";
import { regionFromCountry } from "@/lib/anxiety/regions";
import { SITE_URL } from "@/lib/seo/site";

// Keyword targets (Google Keyword Planner, 2026-10-13, US+CA+UK+AU monthly):
// "anxiety test" 27.8k, "gad 7" 65.5k, "gad 7 scoring" 28.5k, "do i have
// anxiety" ~4.8k, "signs of anxiety" 27k, "panic vs anxiety attack" 63k.
// Research/Anxiety_Test_Keywords_2026-10-13.csv in the Saati folder.
export const metadata: Metadata = {
  title: "Anxiety Test (GAD-7): Do I Have Anxiety? Free, 4 Minutes | Saati",
  description:
    "Free anxiety test using the GAD-7, the questionnaire doctors use. Get your score in 4 minutes, see how anxiety shows up in your life, and one small next step. No sign-up; answers never leave your browser.",
  alternates: { canonical: `${SITE_URL}/anxiety-test` },
  openGraph: {
    title: "Anxiety Test (GAD-7): Do I Have Anxiety?",
    description: "Your GAD-7 score in 4 minutes, plus how anxiety actually shows up in your life. Free, private, no sign-up.",
    url: `${SITE_URL}/anxiety-test`,
    type: "website",
  },
};

const FAQ = [
  {
    q: "Can an online test tell me if I have anxiety?",
    a: "No online test can diagnose anxiety; only a health professional can. The GAD-7 is a screening questionnaire: it shows how much anxiety you've had over the last two weeks and whether it's worth talking to a doctor.",
  },
  {
    q: "What is the GAD-7?",
    a: "The GAD-7 (Generalized Anxiety Disorder 7) is a seven-question questionnaire developed by Spitzer, Williams, Kroenke and colleagues in 2006. It is widely used by doctors and by NHS Talking Therapies in England, and its first two questions are the GAD-2 recommended by the UK's NICE guideline CG123 for identifying anxiety.",
  },
  {
    q: "How is the GAD-7 scored?",
    a: "Each of the seven questions scores 0 (not at all) to 3 (nearly every day), for a total of 0 to 21. A score of 0–4 suggests minimal anxiety, 5–9 mild, 10–14 moderate and 15–21 severe. A score of 10 or more is the usual point to talk to a doctor.",
  },
  {
    q: "Do you store my answers?",
    a: "No. The test runs entirely in your browser. Your answers and score are not sent to our server or to analytics, and they disappear when you close the page.",
  },
  {
    q: "What's the difference between an anxiety attack and a panic attack?",
    a: "A panic attack is a sudden rush of intense fear that peaks within minutes, often with a racing heart, shaking, breathlessness or chest pain. \"Anxiety attack\" isn't a clinical term; people usually mean anxiety that builds more gradually around a worry. If you have chest pain or trouble breathing, get medical help to rule out other causes.",
  },
  {
    q: "What if my score is high?",
    a: "Talk to your doctor; you could show them your score. If you ever feel unsafe or in crisis, contact a crisis line or emergency services straight away. The results page lists the right numbers for your country.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const SIGNS = [
  { group: "In your mind", items: ["Worrying a lot, about many different things", "Finding it hard to stop or control the worry", "Feeling on edge or that something bad will happen", "Trouble concentrating, or your mind going blank", "Overthinking and replaying conversations"] },
  { group: "In your body", items: ["A racing or pounding heart", "Tight chest or shallow breathing", "Knotted stomach or nausea", "Tense jaw, shoulders or muscles", "Trouble falling or staying asleep"] },
  { group: "In what you do", items: ["Putting things off or avoiding them", "Cancelling plans", "Being irritable or snappy", "Needing a lot of reassurance", "Feeling restless and unable to sit still"] },
];

export default async function AnxietyTestPage() {
  const h = await headers();
  const region = regionFromCountry(h.get("x-vercel-ip-country"));

  return (
    <div className="calm-theme flex-1">
      <JsonLd data={faqJsonLd} />
      <AnxietyTest region={region}>
        <div className="mx-auto flex max-w-2xl flex-col px-4 pb-16 text-(--c-soft) sm:px-6">
          <details className="group border-t border-(--c-line) py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-(--c-ink) [&::-webkit-details-marker]:hidden"><h2>What this anxiety test measures</h2><span aria-hidden="true" className="text-(--c-accent-ink) transition-transform duration-300 group-open:rotate-45">+</span></summary>
            <p className="mt-3 leading-relaxed">
              Part one is the <strong>GAD-7</strong>, the seven questions doctors use to check for anxiety, word for word. It
              gives you a score out of 21. Part two is a short set of everyday scenes, like lying awake at 3am or replaying a
              conversation, that shows <em>how</em> anxiety shows up for you: in your head, your body, your sleep, around
              people, or as things you put off. At the end you get one small, evidence-based step that fits your pattern.
            </p>
          </details>

          <details className="group border-t border-(--c-line) py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-(--c-ink) [&::-webkit-details-marker]:hidden"><h2>Signs of anxiety</h2><span aria-hidden="true" className="text-(--c-accent-ink) transition-transform duration-300 group-open:rotate-45">+</span></summary>
            <p className="mt-3 leading-relaxed">Anxiety shows up differently for everyone. Common signs include:</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              {SIGNS.map((s) => (
                <div key={s.group}>
                  <h3 className="font-semibold text-(--c-ink)">{s.group}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {s.items.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </details>

          <details className="group border-t border-(--c-line) py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-(--c-ink) [&::-webkit-details-marker]:hidden"><h2>How the GAD-7 is scored</h2><span aria-hidden="true" className="text-(--c-accent-ink) transition-transform duration-300 group-open:rotate-45">+</span></summary>
            <p className="mt-3 leading-relaxed">
              Each question is scored from 0 (not at all) to 3 (nearly every day), for a total between 0 and 21.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--c-line)">
                    <th className="py-2 pr-4 font-semibold">GAD-7 score</th>
                    <th className="py-2 font-semibold">What it suggests</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr className="border-b border-(--c-line)"><td className="py-2 pr-4">0–4</td><td>Minimal anxiety</td></tr>
                  <tr className="border-b border-(--c-line)"><td className="py-2 pr-4">5–9</td><td>Mild anxiety</td></tr>
                  <tr className="border-b border-(--c-line)"><td className="py-2 pr-4">10–14</td><td>Moderate anxiety: worth talking to a doctor</td></tr>
                  <tr><td className="py-2 pr-4">15–21</td><td>Severe anxiety: please talk to a doctor soon</td></tr>
                </tbody>
              </table>
            </div>
          </details>

          <details className="group border-t border-(--c-line) py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-(--c-ink) [&::-webkit-details-marker]:hidden"><h2>Questions people ask</h2><span aria-hidden="true" className="text-(--c-accent-ink) transition-transform duration-300 group-open:rotate-45">+</span></summary>
            <div className="mt-4 flex flex-col gap-5">
              {FAQ.map((f) => (
                <div key={f.q}>
                  <h3 className="font-semibold text-(--c-ink)">{f.q}</h3>
                  <p className="mt-1 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </details>

          <p className="border-t border-(--c-line) pt-6 text-xs text-(--c-soft) opacity-80">
            GAD-7 developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with an educational
            grant from Pfizer Inc. No permission required to reproduce, translate, display or distribute. Saati is a wellbeing
            companion, not a medical service, therapy, or crisis support.
          </p>
        </div>
      </AnxietyTest>
    </div>
  );
}
