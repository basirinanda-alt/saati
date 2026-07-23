import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/marketing/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | Saati",
  description:
    "What Saati collects, why, how long it's kept, and how to request deletion of your data.",
  alternates: { canonical: "/privacy" },
};

// TODO before launch: replace the placeholder contact address below with
// a real, monitored inbox — see PROJECT_STATUS.md.
const PRIVACY_CONTACT_EMAIL = "privacy@atlanticbuddhist.com";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ]}
      />

      <article>
        <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati is a free, evidence-informed wellbeing check-in for students.
          It is not a medical service, not a diagnostic tool, and not a
          therapy replacement. This page explains plainly what we collect,
          why, and how you can ask us to delete it.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What we collect
        </h2>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            Your answers to the WHO-5, PERMA-Profiler, and Saati Insights
            questions.
          </li>
          <li>
            Your email address, which we ask for before showing your
            results.
          </li>
          <li>
            A random identifier stored in a browser cookie, so we can show
            you your past check-ins if you return — no account or
            password is involved.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          We do not collect your name, and we do not ask for anything
          beyond what&rsquo;s listed above to deliver the assessment.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Why we collect it
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Your answers are used only to calculate your results and generate
          your personalised report. Your email is used to send you that
          report and to show you your check-in history if you come back.
          We never use your wellbeing answers, scores, or email for
          advertising, and we do not sell them.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          This is not medical advice
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          Saati does not diagnose any condition, and nothing in your report
          is a clinical assessment. If your results suggest this might be a
          good time to seek extra support, we&rsquo;ll say so plainly and
          point you toward real resources — we never claim to provide that
          support ourselves.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Who else sees your data
        </h2>
        <ul className="mt-3 flex flex-col gap-2 max-w-prose list-disc pl-5 text-neutral-700 dark:text-neutral-300">
          <li>
            <strong>OpenAI</strong> receives your computed scores (never
            your name or email) to help write the plain-language summary
            in your report.
          </li>
          <li>
            <strong>Resend</strong>, our email provider, receives your
            email address in order to deliver your report.
          </li>
          <li>
            Our database is hosted by <strong>Neon</strong>, a managed
            Postgres provider, and our application is hosted by{" "}
            <strong>Vercel</strong>. Neither uses your data for anything
            other than storing and serving it on our behalf.
          </li>
        </ul>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          We do not share your wellbeing answers, scores, or email with
          advertisers, data brokers, or any other third party.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Advertising measurement
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          We run ad campaigns to let students know Saati exists, and we use{" "}
          <strong>Google Ads</strong> conversion tracking to measure whether
          those campaigns are working. This sets a cookie and shares
          general visit information (such as the page you landed on and
          whether you arrived from an ad) with Google — it never includes
          your assessment answers, scores, or email address. You can control
          or opt out of this tracking through your browser&rsquo;s cookie
          settings or{" "}
          <a
            href="https://myadcenter.google.com/"
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
            target="_blank"
            rel="noreferrer"
          >
            Google&rsquo;s Ad Settings
          </a>
          .
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          How long we keep it
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          We keep your responses, results, and email for as long as your
          account&rsquo;s browser cookie is active, so you can review your
          progress over time. We do not currently run an automatic deletion
          schedule — if you&rsquo;d like your data removed sooner, see
          below.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          Requesting deletion
        </h2>
        <p className="mt-3 max-w-prose text-neutral-700 dark:text-neutral-300">
          You can ask us to delete your data at any time by emailing{" "}
          <a
            href={`mailto:${PRIVACY_CONTACT_EMAIL}`}
            className="underline underline-offset-2 hover:text-teal-800 dark:hover:text-teal-300"
          >
            {PRIVACY_CONTACT_EMAIL}
          </a>{" "}
          with the email address you used, or the web address of one of
          your results pages. We&rsquo;ll permanently delete your
          responses, scores, reports, and email within 30 days. Aggregate,
          de-identified statistics that no longer reference you
          individually aren&rsquo;t affected by a deletion request.
        </p>
      </article>
    </main>
  );
}
