/**
 * The HTML body of the ikigai results email.
 *
 * Written to email-client rules, not web rules: tables for layout, every style
 * inline, no flexbox, no grid, no <style> block worth relying on, no webfont
 * (Georgia stands in for DM Serif Display, which no client will load), and a
 * 600px shell. Anything cleverer than this renders somewhere as a stack of
 * unstyled paragraphs.
 *
 * ── On the "chart" ─────────────────────────────────────────────────────
 * The four circles carry NO magnitude. They are four named parts of one
 * person's answers, so the data's job is identity, not size — which means a
 * bar, a donut, or a meter would be inventing a quantity that does not exist.
 * The right form is a labelled 2x2 grid where colour carries identity and the
 * label carries it again, so nothing depends on colour alone. Same reason the
 * PERMA dimension on each plan card is a pill and not a filled meter: we are
 * not scoring anyone here, and a half-filled bar would claim we were.
 *
 * Colours come from CIRCLE_COLORS, a validated categorical set — see the note
 * on that constant before changing one.
 */

import {
  CIRCLE_KEYS,
  CIRCLE_LABELS,
  CIRCLE_COLORS,
  SUPPORTS,
  type IkigaiResult,
} from "./reflection";

const SHELL = "#fff8f4";
const CARD = "#ffffff";
const LINEN = "#fbf2eb";
const CLAY = "#f5ece5";
const AMBER_SOFT = "#f7e6cf";
const INK = "#1f1b17";
const BODY = "#424845";
const MUTED = "#727975";
const LINE = "#e6e0d8";
const SAGE = "#4a645a";
const AMBER = "#D4872C";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Email bodies are assembled as strings, so every interpolation is escaped. */
export function esc(s: string): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function label(text: string, color: string): string {
  return (
    `<div style="font-family:${SANS};font-size:11px;font-weight:bold;` +
    `letter-spacing:1.4px;text-transform:uppercase;color:${color};padding-bottom:8px;">` +
    `${esc(text)}</div>`
  );
}

/** One outer card. `accent` draws a 3px rule down its left edge. */
function card(inner: string, bg: string, accent?: string): string {
  const border = accent
    ? `border-left:3px solid ${accent};`
    : `border:1px solid ${LINE};`;
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="background:${bg};${border}border-radius:10px;margin:0 0 12px 0;">` +
    `<tr><td style="padding:18px 20px;">${inner}</td></tr></table>`
  );
}

/**
 * The four circles as a 2x2 identity grid.
 *
 * Two nested two-column tables rather than one four-cell row: Outlook ignores
 * max-width on table cells, and a single row of four collapses to unreadable
 * slivers on a phone. Two rows of two degrades to a single column instead.
 */
function circlesGrid(result: IkigaiResult): string {
  const cell = (k: (typeof CIRCLE_KEYS)[number]) => {
    const color = CIRCLE_COLORS[k];
    return (
      `<td width="50%" valign="top" style="padding:6px;">` +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
      `style="background:${CARD};border:1px solid ${LINE};border-top:3px solid ${color};border-radius:10px;">` +
      `<tr><td style="padding:16px 16px 18px 16px;">` +
      label(CIRCLE_LABELS[k], color) +
      `<div style="font-family:${SANS};font-size:15px;line-height:1.55;color:${BODY};">` +
      `${esc(result.circles[k] || "")}</div>` +
      `</td></tr></table></td>`
    );
  };
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 -6px 8px -6px;">` +
    `<tr>${cell("love")}${cell("good")}</tr>` +
    `<tr>${cell("need")}${cell("sustains")}</tr>` +
    `</table>`
  );
}

/** The plan: fixed Saati copy, with the model's one personal line per item. */
function planBlock(result: IkigaiResult): string {
  const plan = result.plan ?? [];
  if (!plan.length) return "";

  const items = plan
    .map((item, i) => {
      const s = SUPPORTS[item.id];
      if (!s) return "";
      return (
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
        `style="background:${CARD};border:1px solid ${LINE};border-radius:10px;margin:0 0 10px 0;">` +
        `<tr><td style="padding:18px 20px;">` +
        // dimension pill — a name, not a filled meter: nothing here is scored
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px 0;"><tr>` +
        `<td style="background:${CLAY};border-radius:999px;padding:5px 11px;font-family:${SANS};` +
        `font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:${SAGE};">` +
        `${esc(s.dimension)}</td></tr></table>` +
        `<div style="font-family:${SERIF};font-size:19px;line-height:1.3;color:${INK};padding-bottom:8px;">` +
        `${i + 1}. ${esc(s.title)}</div>` +
        (item.line
          ? `<div style="font-family:${SANS};font-size:15px;line-height:1.6;color:${INK};` +
            `border-left:2px solid ${AMBER};padding-left:12px;margin:0 0 10px 0;">${esc(item.line)}</div>`
          : "") +
        `<div style="font-family:${SANS};font-size:15px;line-height:1.6;color:${BODY};">${esc(s.body)}</div>` +
        `</td></tr></table>`
      );
    })
    .join("");

  return (
    `<div style="font-family:${SERIF};font-size:24px;line-height:1.25;color:${INK};padding:14px 0 6px 0;">` +
    `Where Saati could come in</div>` +
    `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:${MUTED};padding-bottom:16px;">` +
    `Chosen for what you wrote, not for everyone.</div>` +
    items
  );
}

export function buildEmailHtml(greetingName: string, result: IkigaiResult): string {
  const closing = result.closing ?? "";

  return `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your ikigai</title>
</head>
<body style="margin:0;padding:0;background:${SHELL};">
<!-- preheader: shown in the inbox list, hidden in the body -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your four circles, the thread running through them, and where Saati could come in.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SHELL};">
<tr><td align="center" style="padding:28px 12px 40px 12px;">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

  <tr><td style="padding:0 4px 20px 4px;">
    <div style="font-family:${SERIF};font-size:20px;line-height:1;color:${SAGE};">Saati</div>
    <div style="font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:${AMBER};padding-top:5px;">Find your ikigai</div>
  </td></tr>

  <tr><td style="padding:0 4px 18px 4px;">
    <div style="font-family:${SANS};font-size:16px;line-height:1.6;color:${BODY};">
      Hi ${esc(greetingName)}, thank you for taking a few quiet minutes for yourself.
      Here is what you wrote, given back to you.
    </div>
  </td></tr>

  <tr><td style="padding:0 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${AMBER_SOFT};border-radius:12px;margin:0 0 18px 0;">
      <tr><td align="center" style="padding:26px 22px;">
        ${label("At the centre", "#8a5f20")}
        <div style="font-family:${SERIF};font-size:27px;line-height:1.25;color:${INK};">${esc(result.centre)}</div>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:0 4px;">
    <div style="font-family:${SERIF};font-size:24px;line-height:1.25;color:${INK};padding:6px 0 12px 0;">Your four circles</div>
    ${circlesGrid(result)}
  </td></tr>

  <tr><td style="padding:8px 4px 0 4px;">
    ${card(
      label("The thread running through it", SAGE) +
        `<div style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};">${esc(result.thread)}</div>` +
        `<div style="font-family:${SANS};font-size:14px;line-height:1.6;color:${MUTED};padding-top:12px;">` +
        `If that doesn't sound like you, trust yourself over the page. You know your life better than a few questions ever could.</div>`,
      LINEN,
    )}
    ${card(
      label("One small step this week", "#8a5f20") +
        `<div style="font-family:${SANS};font-size:16px;line-height:1.65;color:${INK};">${esc(result.step)}</div>`,
      AMBER_SOFT,
      AMBER,
    )}
  </td></tr>

  <tr><td style="padding:14px 4px 0 4px;">${planBlock(result)}</td></tr>

  ${
    closing
      ? `<tr><td style="padding:8px 4px 0 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${LINEN};border:1px solid ${LINE};border-radius:12px;margin:0 0 18px 0;">
      <tr><td style="padding:24px 22px;">
        <div style="font-family:${SERIF};font-size:18px;line-height:1.6;color:${INK};">${esc(closing)}</div>
      </td></tr>
    </table>
  </td></tr>`
      : ""
  }

  <tr><td align="center" style="padding:10px 4px 4px 4px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:${SAGE};border-radius:999px;">
        <a href="https://saati.ca" style="display:inline-block;padding:16px 34px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#ffffff;text-decoration:none;">Read more about Saati</a>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:26px 4px 0 4px;border-top:1px solid ${LINE};">
    <div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};padding-top:18px;">
      A reflection, not a diagnosis. Saati is a wellbeing companion, not a therapist, counsellor
      or medical service, and nothing here replaces professional care. In Canada you can call or
      text <strong style="color:${INK};">9-8-8</strong> any time if you need to talk to someone now.
    </div>
    <div style="font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTED};padding-top:14px;">
      Inspire Sirius Living Inc. &middot; Halifax, Nova Scotia &middot; <a href="https://saati.ca" style="color:${SAGE};">saati.ca</a>
    </div>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}
