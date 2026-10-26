import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { siteVisitWaiver } from "../lib/morning-workshops";
import { textConsentWording } from "../lib/staff/text-consent";
import { wellnessSessions } from "../lib/wellness-signups-2026";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const slotLabel = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour > 12 ? hour - 12 : hour}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
};
const days = [...new Map(wellnessSessions.map(session => [session.day, session.dayLabel])).entries()];
const dayMarkup = days.map(([day, dayLabel]) => {
  const sessions = wellnessSessions.filter(session => session.day === day);
  const slots = [...new Set(sessions.filter(session => !session.dropIn).map(session => session.start))].sort((a, b) => a - b);
  const selected = slots[0];
  return `<fieldset class="class-day" data-day="${day}" data-active-slot="${selected}">
    <legend>${escape(dayLabel)}</legend>
    <p class="slot-instruction">Choose a time to see the activities available then.</p>
    <div class="time-picker" role="group" aria-label="${escape(dayLabel)} times">
      ${slots.map(slot => `<button type="button" class="time-slot" data-slot="${slot}" aria-pressed="${slot === selected}">${slotLabel(slot)}</button>`).join("\n      ")}
    </div>
    <div class="class-grid">
      ${sessions.map(session => `<label class="activity class-option" data-day="${session.day}" data-slot="${session.start}" data-start="${session.start}" data-end="${session.end}"${session.dropIn ? " data-dropin" : ""}${session.start !== selected && !session.dropIn ? " hidden" : ""}>
        <input type="checkbox" name="sessions" value="${session.id}" aria-label="${escape(`${session.time} ${session.title}, ${session.dayLabel}`)}">
        <span><strong>${escape(session.title)}</strong><small>${escape(session.note)}</small></span>
        <b>${escape(session.time)}</b>
      </label>`).join("\n      ")}
    </div>
  </fieldset>`;
}).join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Wellness Classes | Not Alone Summit</title>
  <link rel="icon" href="/tennis-high-tea/favicon.svg">
  <link rel="stylesheet" href="/tennis-high-tea/styles.css">
  <link rel="stylesheet" href="/wellness/wellness.css">
</head>
<body>
<main class="event reference-layout">
  <section class="reference-hero">
    <div class="reference-inner">
      <div class="brand-row"><img class="reference-icf" src="/tennis-high-tea/brand/icf-logo-white.png" alt="Inspiring Children Foundation" width="1500" height="1136"><span class="brand-divider" aria-hidden="true"></span><img class="reference-summit" src="/tennis-high-tea/brand/summit-logo.png" alt="Not Alone Summit" width="1507" height="1681"></div>
      <h1>Morning <span>Wellness</span></h1>
      <p class="intro">Step away, recharge and take care of yourself. Explore cold plunges and saunas, Somadome meditation pods, red light therapy, Hyperice recovery tools, Shiftwave chairs, Tabl'eau filtered water, letter writing, hat making with Hey I'm Here For You, and chiropractic care.</p>
      <p class="audience">For Not Alone Summit attendees.</p>
      <div class="event-details">
        <div><div class="detail-label">DATES</div><strong>Monday, November 2<br>Tuesday, November 3<br>Wednesday, November 4</strong></div>
        <div><div class="detail-label">HOURS</div><strong>Monday: 12:00–3:00 PM<br>Tuesday &amp; Wednesday: 8:00–10:00 AM</strong></div>
        <div><div class="detail-label">WHERE</div><strong>Wynn Las Vegas</strong></div>
      </div>
    </div>
  </section>
  <section class="form-panel">
    <div class="reference-inner"><div class="form-content">
      <div class="eyebrow">SIGN UP</div>
      <h2>Choose a time, then an activity</h2>
      <p class="subcopy">Pick a time to see what is available. You may choose sessions across multiple times and days; overlapping sessions will be unavailable.</p>
      <form id="rsvp">
        <div class="fields">
          <div class="field-group"><label for="name">Full name *</label><input id="name" name="name" autocomplete="name" required maxlength="120"></div>
          <div class="field-group"><label for="email">Email address *</label><input id="email" name="email" type="email" autocomplete="email" required maxlength="254"></div>
          <div class="field-group phone-field"><label for="phone">Phone number *</label><input id="phone" name="phone" type="tel" autocomplete="tel" required minlength="7" maxlength="40"></div>
        </div>
        ${dayMarkup}
        <section id="selection-summary" class="selection-summary" aria-live="polite" hidden><h3>Your selections</h3><div id="selection-list"></div></section>
        <fieldset class="transport-choice waiver-choice"><legend>Activity waiver *</legend><p class="waiver-text" id="waiver-text"><strong>Waiver.</strong> ${escape(siteVisitWaiver.text)}</p><label class="transport-option waiver-agree"><input type="checkbox" name="waiverAccepted" required aria-describedby="waiver-text"><span>I have read and agree to the waiver</span></label><div class="fields waiver-fields"><div class="field-group waiver-signature"><label for="signature">Type your full name to sign *</label><input id="signature" name="signature" required maxlength="120" autocomplete="off"></div></div><input type="hidden" name="waiverVersion" value="${escape(siteVisitWaiver.version)}"></fieldset>
        <fieldset class="transport-choice text-consent-choice"><legend>Text updates</legend><label class="transport-option text-consent"><input type="checkbox" name="textConsent" value="yes"><span>${escape(textConsentWording)}</span></label></fieldset>
        <div class="hp" aria-hidden="true"><label for="website">Website</label><input id="website" name="website" tabindex="-1" autocomplete="off"></div>
        <p class="exclusive">This is exclusive to attendees of the Not Alone Summit, an invitation-only event. Sign-ups from anyone not on our guest list will be removed.</p>
        <p id="error" class="error" role="alert" hidden></p>
        <button class="primary" type="submit">Sign up</button>
        <p class="privacy">Your details will be used to coordinate this event.</p>
      </form>
      <div id="confirmation" class="confirmation" role="status" hidden><div class="confirmation-mark">✓</div><h3>You’re signed up.</h3><p>We look forward to seeing you.</p><div id="confirmed-activities" class="confirmed-activities"></div></div>
    </div><footer>Inspiring Children Foundation <span>×</span> Not Alone Summit</footer></div>
  </section>
</main>
<script src="/wellness/form.js" defer></script>
</body>
</html>`;

writeFileSync(join(root, "public", "wellness", "index.html"), html);
