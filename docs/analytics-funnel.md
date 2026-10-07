# Quiz funnel analytics (GA4)

GA4 property for this site: **G-B9TTWNG3SS** (loaded in `app/layout.tsx`).
The same event names and parameters are used on the static quiz pages at
wellness.saati.ai (property G-2G98TP7CLD), so a funnel report reads the same on both.

## Events

| Event | Fired from | Parameters |
|---|---|---|
| `quiz_start` | `AssessmentFlow` mounts (the flow opens on question 1) | `quiz` |
| `quiz_step` | a question is reached for the first time (Back + forward is not a new step) | `quiz`, `question_number`, `total_steps` |
| `quiz_complete` | results page, once per session per tab (`TrackQuizComplete`) | `quiz` |
| `app_cta_view` | `AppDownloadCta` renders | `app_source`, `app_platform` |
| `app_cta_click` | App Store / Google Play button | `store` (`ios`/`android`), `transport_type: beacon`, `app_source`, `app_platform`, `app_placement` (`results_cta` = `AppDownloadCta`, `showcase` = the `AppShowcase` badges at the top of the results page) |
| `app_link_email_captured` | "Email me my report + the app link" succeeded | `app_source`, `app_platform` |
| `conversion` (Google Ads) | unchanged: only when a session's first email is captured | `send_to` |

`quiz` is `wellness_quick` (`/quick-checkin`) or `wellness_full` (`/assessment`).
`/ikigai` is the static page in `public/ikigai/`; it fires the same events with `quiz: ikigai`
and picks this property by hostname.

Never sent: answers, scores, names, email addresses, crisis-screen events.

## Consent

Consent Mode v2, set `beforeInteractive` in `app/layout.tsx`: everything starts denied.
`components/ConsentBanner.tsx` asks once; **Allow** grants `analytics_storage`, `ad_storage`
and `ad_user_data` (GA + Google Ads conversions); `ad_personalization` always stays denied.
The choice is stored in `localStorage` under `saati_analytics_consent`, shared with `/ikigai`,
and is identical to the wellness.saati.ai quiz pages (decided 2026-10-05). Only visitors
who allow appear in reports; Google models the rest.

## GA4 setup

1. Admin › Custom definitions: event-scoped dimensions `quiz`, `question_number`,
   `total_steps`, `store`, `app_platform`, `app_source`, `app_placement`.
2. Mark `app_cta_click`, `app_link_email_captured`, `quiz_complete` as key events.
3. Explore › Funnel exploration: `quiz_start` → `quiz_step` (question_number = 5) →
   (= 10) → `quiz_complete` → `app_cta_click`, broken down by device category.

Verify with GA4 › Admin › DebugView (Google Tag Assistant enables debug mode).
