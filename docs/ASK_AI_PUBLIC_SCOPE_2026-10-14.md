# Ask AI public scope for owner approval

Status: owner approved this public-data scope on October 14, 2026. Implementation is on the `codex/site-improvements` review branch. Production deployment remains pending a review of the finished build.

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

The owner approved using public Airtable-derived facts in short answers, excluding raw entries and all private or staff-only fields, and approved the three official domains above. The site already has a working OpenAI API integration; a secret API key is configured on Netlify. The local stored key successfully completed a model and domain-limited web search test. Netlify masks its key, so its billing account cannot be inferred from local credentials. The OpenAI API payment method must be checked in the billing account that owns the deployed key.
