# Ask AI attendee update — October 27, 2026

Status: **IMPLEMENTED locally / NOT DEPLOYED.** This isolated patch starts from shared production commit `39f561da94a6ce24a2191089f9294281344f2ed2`. It excludes the unpublished wellness/reminder and reading/viewing work in other local checkouts.

## Release blocker

Netlify's published deploy inspected October 27 at about 6:15 PM Pacific was `6ae143225854ab5a8ebf841a`, described as “Awards doors 6:45 PM and owner-requested portrait corrections,” published at 5:34 PM. The shared production branch still points to October 26 commit `39f561d`; GitHub provides read access upstream and write access to Nick's existing fork. Porter must push source matching the live deploy and identify its commit. Do not publish the older shared checkout over today's live changes. Reconcile this scoped patch against that source, inspect its diff, rebuild, and run the supplied acceptance checks on the actual deployed panel.

## What changes

- Both site domains use published Summit, Awards and Nevada Mental Health Day information. The retired cross-domain refusal helper is removed.
- Schedule answers use the same safe public snapshot as `/schedule`. Tuesday compound questions include both sessions and lunch, even after a busy morning. Day answers include every matching public item rather than the app interpreter's first-eight preview. Dates and times use each item's IANA timezone; equivalent UTC representations of a single instant render once. Each item includes its published location and attire. Missing room names stay unconfirmed. Page/editorial timing fallbacks cannot override the published Awards records.
- The approved Google Doc export is checked per request with a five-minute, URL-specific memory cache, a ten-second network timeout, a 60 KiB streaming cap, last-good-copy fallback and concurrent-fetch coalescing. HTML sign-in pages are rejected. Nothing requires Drive authentication or a new internal-data integration.
- Common parking, explicit room-block nights, airport guidance, packing, badge pickup and concierge questions can quote the current FAQ without calling a model. Missing hotel block nights are never inferred from the event dates. The full labeled FAQ remains available to the model for other logistics.
- FAQ, public-fact and model changes invalidate cached model answers even when the snapshot revision is unchanged. Official-domain web search is optional (`tool_choice: auto`) so an answer already covered by the supplied sources does not require a search. This follows the [OpenAI web search guide](https://developers.openai.com/api/docs/guides/tools-web-search).
- Private-details questions are stopped before public-person matching or a provider call and receive the concierge contact. Crisis responses preserve every paragraph of the FAQ's section verbatim; when no valid FAQ section has ever loaded, the existing approved crisis fallback remains available. No attendee transaction or operational data source is added.
- The request/response JSON contract, attendee panel and example questions are unchanged. `/ask`, its noindex metadata and requested examples already exist in the shared baseline; they are retained and verified locally.

## Configuration and model

Both variables are server-only and documented in `apps/web/.env.example`:

- `ASK_AI_FAQ_URL`: public plain-text Google Doc export URL, in the form `https://docs.google.com/document/d/DOC_ID/export?format=txt`.
- `ASK_AI_LOG_KEY`: shared secret accepted only in the `x-ask-ai-key` header of the CSV endpoint. Never include it in a URL, public variable, repository, screenshot, or chat. Reuse the existing configured secret; no rotation is needed for this patch.

Read-only Netlify inspection confirmed the handoff's exact FAQ URL is already configured, `ASK_AI_LOG_KEY` exists (its value was not revealed), and `ENABLE_AI` is true. `OPENAI_MODEL` was not listed. The shared implementation defaults to **gpt-5.4-mini**, with an optional server-side `OPENAI_MODEL` override. Actual provider calls were mocked during tests; the live provider model/version was not independently queried. Schedule, known FAQ, privacy and crisis answers remain deterministic and log `model: deterministic`.

## Question log and retention

Accepted questions retain their original submitted wording, including whitespace. Persist only `ts`, `question`, `answer`, `sources`, `latencyMs`, `model` and `faqRevision`. No request headers, IP addresses, user agents, cookies or session identifiers are added. Existing per-instance model burst protection remains separate from the persisted log.

Production uses the dedicated strongly consistent Netlify Blobs store `ask-ai-logs`. Local development writes an ignored `work/ask-ai-log.jsonl` with restrictive file permissions; tests use isolated memory. A log-write failure does not break an attendee answer and logs no SDK error detail or question text. As with any persistence failure, the affected row can be missing; do not claim lossless logging during a store outage.

`GET /api/ask-ai/log.csv?from=YYYY-MM-DD&to=YYYY-MM-DD` requires `x-ask-ai-key`. Dates are actual calendar dates; the range is inclusive in UTC. Export selects the oldest 10,000 matching rows across all blob listing pages and reads them in bounded batches. It quotes CSV correctly, neutralizes spreadsheet formulas, and returns `Cache-Control: no-store`. Formula neutralization adds an apostrophe to affected CSV cells only; stored questions are unchanged. A store failure returns a generic 503. Wrong/missing credentials return 401.

Retention ends January 1, 2027 at midnight Las Vegas time (`2027-01-01T08:00:00Z`). New log writes and exports stop at that instant. The custom Netlify scheduled function `ask-ai-log-retention` runs hourly, is inert before the deadline, and removes only blobs in this dedicated store afterward. Work is time-bounded and resumes next invocation if necessary. Source: [Netlify scheduled functions](https://docs.netlify.com/build/functions/scheduled-functions/). Ensure the deployment uses `apps/web/netlify.toml`, including its custom functions directory, and confirm the scheduled badge/next run in Netlify after release. The function bundled successfully with the existing esbuild dependency; scheduling is not verified live until deployed.

## Local verification

- Focused Ask AI tests: **114 passed** across seven files, including privacy, crisis paragraphs, cross-domain routing, precedence, FAQ failure/truncation, cache invalidation, CSV authorization/escaping, oldest-first pagination and retention isolation.
- Web TypeScript/lint-equivalent check: **passed** using the installed workspace TypeScript binary.
- Normal Next.js production build (Turbopack): **passed** using the installed workspace binary, public bundled snapshot, no live credentials, and no snapshot refresh.
- Full web suite: **810 passed / 80 failed**. Untouched shared production baseline: **776 passed / the identical 80 failed**. No added failing tests. These baseline failures concern existing presentation/RSVP expectations; no release-ready claim is made for the overall repository.
- An exploratory webpack build reports unrelated pre-existing route-export type guards; normal configured Turbopack build passes. No production configuration was changed to suppress errors.
- Local production-server panel at `/ask` visually verified with the combined Tuesday attire/lunch question. Public FAQ was loaded from the supplied export. All 12 supplied questions were exercised over HTTP locally; this is **not** post-deployment acceptance. Local CSV returned 200 with a local-only test key and 401 without it. The separate acceptance test verifies exactly 12 records with no identifying metadata.

## Remaining staff/source work

1. Obtain and reconcile the source matching the latest live deploy before publication.
2. Add explicit hotel room-block nights to the public FAQ. The current document does not state them; acceptance question 4 correctly receives an honest concierge handoff until staff adds that fact.
3. Preserve the latest owner-approved doors time (live deploy says 6:45 PM), Awards 8:00 PM start, all portraits and other intervening changes. The older handoff's 6:30 PM doors statement is superseded by the newer live source. No schedule admin records were changed here.
4. Confirm session attire and the times/locations/publication of optional Zero Bond and River items through the canonical schedule workflow. Do not create invented schedule instants.
5. After releasing the reconciled build, run the supplied 13 checks from `notalonesummit.org/schedule`, record full answers/sources, verify CSV rows using the existing protected key, and confirm the retention function is deployed. A local test is not evidence of this production behavior.
