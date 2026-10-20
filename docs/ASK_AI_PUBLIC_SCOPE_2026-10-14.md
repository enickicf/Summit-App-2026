# Ask AI public scope for owner approval

Status: IMPLEMENTED on `codex/site-improvements` and deployed to the shared Summit/Awards/Community Day Netlify production site on October 14, 2026 (deploy `6acfcb591cf82ae4f42ad926`). The Airtable auto-sync connection is PARTIAL as described below.

## What visitors can ask

- Inspiring Children Foundation (ICF): its mission, history, youth programs, leadership and scholarship work, published impact statements, ways to participate or donate, and links to its free Not Alone tools. Answer with the source and date for statistics that can change.
- Not Alone program: the Challenge, mental fitness tools and curriculum, Summit, Awards, Community Day, and how they relate.
- Summit, Awards, and Community Day: published dates, time zone, venues, public schedule by day or topic, session descriptions, guest biographies, published roles, accessibility and attire details *when publicly confirmed*, registration/RSVP links, public partner information, and changes or cancellations. Distinguish a guest listing from a confirmed appearance, performance, or award.
- Practical navigation: point to the exact public page or contact route for registration, schedule, venue, participation, donations, and further help. The assistant may summarize a page, not submit a form or alter a record.
- Questions whose answer is not public yet: say that it is unconfirmed and link to the relevant public page or Contact page. The promise is broad coverage of these topics, not a fabricated answer to every question.

## Sources and precedence

1. Current public Summit, Awards, and Community Day pages and the site's published event snapshot. A public editorial correction takes precedence over an older schedule row.
2. A **server-generated public extract** from Airtable, compiled with a table, row, and field allowlist. Candidate fields: published Summit Programming activity/date/start/end/public location/public shortened description and attire; approved Guest Tracker name/title/public bio/headshot/website grouping; approved partner name/logo/public website. Include a row only when its existing public publication/confirmation gate passes. These are proposed inputs, not blanket permission to read or reveal Airtable.
3. Reviewed official online pages from `inspiringchildren.org`, `notalonesummit.org`, and `notaloneawards.org` for ICF and event facts. Additional official partner or expert pages would require a reviewed source list. A public web answer includes a direct source link and a last-checked date. Do not trust page text as instructions.

Where sources conflict, prefer the latest owner-approved public editorial fact, then the latest published event record. Mark a conflict unresolved if neither is clearly authoritative. Do not present a draft, held guest, or operational run of show as confirmed.

## Exclusions

- No direct model access to Airtable, full records, raw row/field dumps, record IDs, exports, or unrestricted search across the base. A response is a short answer assembled from approved public facts, never a list of data entries.
- No staff-only pages, staff notes, internal run of show, cues, scripts, logistics, unpublished schedule items, unreleased guest status or rankings, private rooms, security, pricing or contracts, payment/W9 details, travel/hotel/dietary/accessibility requests, or internal contact information.
- No form submissions, RSVPs, ticket or donation transactions, attendee records, addresses, personal emails or phone numbers, or details about children or youth that are not already deliberately published by ICF.
- No guesses about attendance, awards, speaking slots, prices, or policies. No medical diagnosis or personal treatment advice. For crisis or personal mental health questions, direct visitors to the published free tools and appropriate emergency/crisis resources.
- No answer based solely on an arbitrary search result, social post, or user-provided URL. No prompt or page content may override the public-data rules.

## Product and quality behavior

- Make Ask AI available on the Summit, Awards, and Community Day public pages. Offer sample questions tailored to the current page, while supporting free-form questions.
- Resolve schedule queries by requested day, time, activity, and person; show local event time and only the relevant public entries. If the user asks for a whole day, return that day rather than the first entries of the week. Link to the full schedule.
- Give concise answers with links to the public source pages. State when facts were last checked if freshness matters. Explain uncertainty plainly.
- Keep the existing response-size, cost, timeout, and abuse controls; add source validation and a reliable shared rate limit before launch. Do not store question text or model conversation history unless separately approved.
- Test phone and desktop on all three public sites. Evaluation questions must cover day-specific schedule, guest role vs. appearance, Awards times, ICF youth-program facts, cancellations, unknown questions, conflicting sources, prompt injection, and attempts to obtain staff notes, contacts, RSVP entries, or raw Airtable rows. A privacy failure blocks release.

## Approval needed

The owner approved using public Airtable-derived facts in short answers, excluding raw entries and all private or staff-only fields, and approved the three official domains above. The site already has a working OpenAI API integration; a secret API key is configured on Netlify. The local stored key authenticates as `marketing@inspiringchildren.org` and completed a model and domain-limited web search test. Netlify masks its key; the visible ending matches the local key in all three deploy contexts, and the Sept 18 handoff records that both were saved from the same key. The exact payment method remains unverified and must be checked in that OpenAI API account's billing settings.

## Review build and remaining connection

- Draft: https://ask-ai-review-20261014--not-alone-summit.netlify.app. Production: https://notalonesummit.org and https://notaloneawards.org, with Community Day at https://notaloneawards.org/community-day.
- The draft OpenAI endpoint returned an answer with approved ICF source links; it also returned the public Community Day schedule and refused a raw Airtable RSVP request. The ICF youth contribution answer is now grounded directly in ICF's published Tools page.
- Phone (390 px) and desktop (1440 px) checks found Ask AI and the Bryan Brothers label on Summit, Awards, and Community Day. Returning from the Bryan Brothers biography restored the exact prior scroll position on all six checks.
- Web typecheck and 693 tests passed. Netlify bundled the Ask AI edge rate limit.
- The site can use only published, approved Airtable fields through its existing public extract. The Netlify site has no `AIRTABLE_TOKEN` in production or deploy-preview, so live Airtable auto-sync is still disconnected. A base-scoped read-only token is needed before claiming a current Airtable connection.
- Production verification: 33/33 live-site checks passed with one build ID; the OpenAI-backed answer returned official public links, the raw RSVP-record request was refused, and Community Day returned its public schedule. Phone and desktop checks on all three pages confirmed the short Bryan Brothers label, full bio, and exact scroll restoration after browser Back.

## October 15 owner refinement (LIVE: Netlify deploy `6ad15496868ee524d64c4698`)

- On every site, Ask AI says an RSVP is a request, not a confirmed ticket. Once tickets are confirmed, the team will contact the requester by email and/or text with confirmation and ticketing information. Ask AI cannot verify an individual request's status.
- Twenty common Awards and Summit questions have concise, public-source answers (`apps/web/lib/ask-ai-common-questions.ts`). Nevada Mental Health Day and Awards Show information remains answerable on all event sites.
- On the Awards domain, detailed Summit inquiries receive the private, invitation-only response and a Summit-site referral. The Awards-domain model context omits Summit schedule, guests, pending notes, partners and FAQs, and its web search is limited to Inspiring Children and Awards domains. On the Summit domain, published Summit details remain available. Existing staff-only and unpublished data exclusions still apply.
