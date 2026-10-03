# Independent Website Audit

September 16, 2026. Source inspection and local unit probes only. Review performed
while owner-authorized agents were editing the same worktree. References below
identify the inspected lines and symbols; later edits can move those lines.
Findings describe reproduced audit baselines, with follow-up status noted where
concurrent fixes were re-inspected. They are not a final count of unresolved bugs.

## Scope And Result

- Read root `AGENTS.md`, `apps/web/AGENTS.md`, ownership/restoration/ROS documents,
  and bundled Next 16.3.3 documentation for production readiness, metadata, and
  images before writing this report.
- Inspected all website routes, active components, styles, public-content
  adapters, asset maps, relevant shared model/fixtures, unit tests, and acceptance
  script source. No browser, Playwright execution, external requests, production
  writes, native changes, commits, or deployments were performed by this reviewer.
- Initially only this document was authorized. The parent subsequently assigned
  a bounded F11 follow-up in three acceptance scripts; those changes are listed
  below. Application changes observed during review belong to other agents.
- Release-ready status is not established. The initial implementation contains
  factual-provenance blockers, misleading operational states, and accessibility
  and acceptance-test gaps despite a passing website unit suite.
- Keep the 2025 format. None of the recommendations requires a visual redesign,
  removal of historical participants, a new service, or an invented current fact.

## Priority Findings

### F01: P1 - Attendance Restores Historical Host Assignments

**Evidence:** `CurrentAwardsPage` selects `confirmedHost` from `awards[3].people`
using only an attendance-name match, then renders the historical `Host` section.
See [original-event-page.tsx:148](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.tsx:148)
and its render at line 181. The current Summit also calls unrestricted
`Leadership({ confirmedNames })` at line 131, reintroducing the historical
`Summit Host` and `Awards Host` groups for Jason Kennedy and Loni Love.

**2026 evidence checked:** The entire 32-row reviewed ROS contains no host
assignment. Its Awards Show row has title and times only, at
[ros-2026.ts:36](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/test-fixtures/src/ros-2026.ts:36).
All generated timed sessions have `speakerIds: []`; both people receive
`Confirmed 2026 guest`, `Attendees`, and attendance-only `roleSource`, at
[event-2026.ts:47](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/test-fixtures/src/event-2026.ts:47)
and line 68. The documented owner exceptions cover original producers/chairs,
not hosts. [2026_ROS_IMPORT.md:57](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/docs/2026_ROS_IMPORT.md:57)
explicitly says attendance does not imply an old host role.

**Saved-publication cross-check:** The local record of published revision 9, not
just generated fixture code, independently lists Jason at
[after-revision-9.json:916](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/work/acceptance/ros-2026/after-revision-9.json:916)
and Loni at
[after-revision-9.json:929](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/work/acceptance/ros-2026/after-revision-9.json:929)
as `Confirmed 2026 guest`, category `Attendees`, with `Attendance only; no speaking
role inferred` at lines 924 and 937. Its Awards Show has `speakerIds: []` at line
346, and its current Awards program says the complete show lineup remains to be
confirmed at line 1701. The saved preceding revision 8 also lists guest-only roles
at `before-revision-8.json:1271-1284`. No separate reviewed host approval was found
in these saved publications or the reviewed ROS. The older local-store backup's
generic `Summit Host Team` is pre-replacement content, not approval for these two
named 2026 hosts. These local records are evidence of the reviewed publication
history, not a fresh assertion about the live API today.

The captured original ICF pages contain mixed-year dates, explicitly documented
in `ORIGINAL_SITE_RESTORATION.md`; their old host sections are therefore not
independent 2026 approval. The historical host markup already existed in
owner-authorized website commit `d674bd2`, which proves implementation provenance,
not the truth of a current event role. Do not characterize that work as an
unauthorized collaborator change.

**Reproduction:** Static-rendering the reviewed fixture produces Loni under
`<h2>Host</h2>` on current Awards and both historical host headings on Summit.
The regression test at
[original-sites.test.tsx:15](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/lib/original-sites.test.tsx:15)
actually requires current and historical Host markup to be identical.

**Fix:** Retain both people as confirmed guests. Do not display a 2026 event-host
assignment until separately approved current-role evidence exists. Keep 2025 host
cards untouched and preserve approved confirmed chair/producer credits. Replace
the host-copy assertion with a negative attendance-only role test.

### F02: P1 - Current Summit Promotes Historical Groups And Activities

**Evidence:** [original-event-page.tsx:132](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.tsx:132)
renders `summit2025Highlights` under `Featuring` in both years. Lines 134-136
render attendance-filtered 2025 groups followed by the canonical 2026 directory.
[content.ts:6](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/lib/content.ts:6)
contains 14 historical activities, including Pitches, Meditation, Product Launches,
and Exclusive VIP Experiences, none established as current activities by the
reviewed ROS. Historical group names, affiliations, and offsite profile links
are copied rather than obtained from current published profile metadata.

**Quantification:** With the 51-person reviewed fixture, this adds 18 historical
portrait entries across five nonempty groups: 8 Founders, 2 Musicians, 4
Entertainers & Athletes, 3 Experts, and 1 Business Leaders & Philanthropists.
The complete 51-person current directory follows those sections. Static-rendered
name headings include Jewel five times, Jason Kennedy and Loni Love three times
each, and Ryan Wolfington three times. Some duplication is approved production
credit; the extra historical group memberships are not established by attendance.
The Summit search only searches the lower current directory, leaving matching
and nonmatching historical cards above it unchanged.

**Fix:** Preserve the archive's full groups and feature list. On 2026, render one
canonical current directory and only reviewed current programming, while keeping
the same portrait-grid/section design. Keep independently approved chair and
producer credits explicit. Add tests that attendance-only fixtures cannot import
2025 Founders membership, affiliations, activity promises, or historical links.

### F03: P1 - An Explicitly Canceled Awards Show Still Advertises Its Time

**Evidence:** [original-event-page.tsx:150](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.tsx:150)
excludes canceled shows from hero-date selection, but line 153 checks the program's
`published` flag only. Line 179 still renders its unchanged timetable, and RSVP
actions remain. Cancellation is represented as `Date to be confirmed`, not canceled.

**Reproduction:** Clone the reviewed fixture, change only Awards Show's status to
`canceled`, and pass its still-published Awards program to `OriginalAwardsPage`.
The resulting markup simultaneously contains `Date to be confirmed`,
`Awards Show: 8:00-10:00 PM`, and `Awards RSVP`. The test at
[original-sites.test.tsx:205](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/lib/original-sites.test.tsx:205)
cancels the show AND unpublishes the program together, missing this realistic
single-field update. Rescheduling can create the same hero/program disagreement.

**Fix:** Make cancellation explicit and prevent the page from advertising the
canceled timetable as an active program. Coordinate program facts with canonical
schedule status/timing instead of maintaining a second authoritative timetable.
Test cancellation, rescheduling, missing program, and unpublished program
independently. Do not guess replacement dates or assume the whole gathering is
canceled just because one activity is canceled.

### F04: P2 - Offline Fallback Is Indistinguishable From Current Publication

**Evidence:** [snapshot.ts:54](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/lib/snapshot.ts:54)
returns `publicProjection(reviewedOfflineSnapshot)` on API failure, with no
freshness/source field. [schedule/page.tsx:20](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/schedule/page.tsx:20)
calls this `Published event schedule`; the live route can call it `Live event`.
The fixture is reviewed 2026 data, not demo data, but is fixed at revision 9 and
September 16 publication time. It is not a cache of the last successful response.

**Reproduction:** With `fetch` mocked to throw, `getReviewedContentSnapshot()` is
null while `getPublicSnapshot()` returns revision 9 and 26 timed activities.
Thus current guests disappear correctly, but old schedule times/cancellations
can reappear without a warning when the API is unavailable.

**Fix:** Preserve essential offline schedule availability, but carry explicit
source/freshness information and show its actual publication date plus refresh
failure. Never describe an undated bundled fallback as fresh/live data. Test a
newer publication followed by failure, as well as a deliberately empty live
publication, without restoring withdrawn people.

### F05: P2 - Live Companion Says The Event Ended On A Pending-Timing Day

**Evidence:** [summit/live/page.tsx:54](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/summit/live/page.tsx:54)
renders `The published program has concluded` whenever current/upcoming timed
items are absent, regardless of `phase` or published pending notes.

**Reproduction:** At `2026-11-05T18:00:00Z` the actual reviewed fixture yields
`phase: live`, `current: []`, and `upcoming: []`. Tennis at 10 AM and High Tea at
noon remain published timing notes for that day. An empty schedule also yields
`phase: empty` and the same incorrect concluded paragraph. The domain already
handles pending days at
[packages/domain/src/index.ts:138](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/domain/src/index.ts:138).

**Fix:** Branch separately for after-event, empty, inter-session, and pending-day
states. Surface the canonical notes/link without inventing durations. Add those
four render tests. Also disclose or address the current server-only behavior:
`nowUtc` is computed once per request and the displayed countdown does not tick
or refresh while a visitor leaves the page open.

### F06: P2 - Schedule Tabs And Highlights Lose Expected Keyboard Behavior

**Evidence:** [schedule-browser.tsx:50](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/schedule-browser.tsx:50)
declares `tablist`/`tab` but has no roving tab index, Arrow/Home/End handlers,
`aria-controls`, linked panel IDs, or `tabpanel`. All five tabs remain ordinary
Tab stops. Use a complete tabs pattern or simple named filter buttons instead.

**Concurrent follow-up:** The new `ScheduleBrowser` inspected at 22:19 local time
does implement roving focus, Arrow/Home/End navigation, linked panel IDs, and
`tabpanel`. A static probe confirmed exactly one selected `tabindex="0"` and four
unselected `tabindex="-1"` controls for the five-day fixture. The schedule portion
of this finding is source-addressed; browser verification remains with the parent.

At [awards-highlights.tsx:25](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/awards-highlights.tsx:25),
Play removes the focused poster button; Close removes itself, with no ref-based
focus handoff or restoration. The iframe `onError` path is not a reliable report
of an embedded provider refusing playback. The always-visible YouTube fallback
is good and must stay. Add keyboard play/close focus checks and blocked-embed
coverage; do not claim embedded playback works based on initial static markup.

### F07: P2 - Ask AI Client Can Fail Silently Or Show An Older Answer Last

**Evidence:** [ask-ai/page.tsx:8](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/ask-ai/page.tsx:8)
has no catch, loading state, cancellation/request ordering, response validation,
or disabled submission while pending. Two requests can resolve out of order;
network/non-JSON responses reject without user-visible recovery. Line 9 has only
a placeholder as input naming and no live answer/status region.

**Fix:** Add a persistent accessible label, pending/error states, bounded response
validation, and abort/sequence handling. Announce completed/error responses.
Do not promise schedule answers until the server supports them: the concurrently
improved endpoint still returns its generic fallback for `What is the schedule?`
at [api/ask-ai/route.ts:35](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/api/ask-ai/route.ts:35),
while the initial client copy advertises schedule assistance. Existing shared
concierge logic is available; any reuse must preserve the current confirmation
filter. Test failed, malformed, and reversed-order responses.

**Concurrent follow-up:** The new `ask-ai-form.tsx` inspected at 22:19 implements
a persistent label, status/alert regions, disabled/read-only pending controls,
abort-on-unmount, and an active-request guard. `ask-ai/page.tsx` no longer promises
that the tool answers schedule questions. This finding's original client defects
are source-addressed; parent should verify the final request helper and runtime
flow before closing the checklist.

### F08: P2 - Measurable Contrast Failures Remain In Shared CSS

**Evidence:** [styles.css:10](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/styles.css:10)
sets `.primaryButton` to white on `#e990b4`: computed contrast 2.30:1. The inherited
hover background `#d75f4b` at line 1 is 3.73:1. Small eyebrow text `#ae7b2f` on
`#fff9f1` is 3.54:1. These miss 4.5:1 for normal-sized text. The archive Summit
portrait hover at
[original-event-page.module.css:46](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.module.css:46)
uses white on `#7996c0`, 3.03:1, for 15-17px copy. This is arithmetic from declared
solid colors, not a browser-computed-style audit.

**Fix:** Adjust foreground/background pairs and focus/hover states conservatively,
retaining the original event palette and layout. Recheck active elements after
all overrides land. Provide a global reduced-motion override for inherited
`html { scroll-behavior: smooth }` at styles.css:1. Remove negative tracking and
viewport-scaled headings on active support/schedule surfaces while maintaining
readable typography; do not broadly restyle the archive.

### F09: P2 - Unoptimized Images Impose Large Full-Scroll Downloads

**Evidence:** Raw `<img>` usage at
[original-event-page.tsx:81](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.tsx:81),
line 111, and [awards-guest-directory.tsx:29](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/awards-guest-directory.tsx:29)
has no responsive `srcset`/`sizes` or optimized derivatives. Source asset stat
inventory: 165 raster files, 73,842,267 bytes total; 58 exceed 500,000 bytes.
Unique image files referenced by archive markup, excluding shared shell assets,
total 38,233,650 bytes for Summit (84 paths) and 39,444,877 bytes for Awards
(82 paths including restored producers). These are file-size totals, not
measured initial page transfers; lazy loading delays offscreen requests.

The current reviewed roster's 21 available portraits total 11,307,708 bytes.
Examples: Jewel 1,635,711 bytes, Jen Smorgen 1,076,575, Jon Hershfield 780,204.
Shared 100px footer logo is 452,270 bytes; the header logo is 196,741 bytes.
All 109 pinned asset mappings resolved to real local files during inspection.

**Fix:** Produce size-appropriate optimized derivatives while retaining source
files/provenance, or use documented Next Image sizing/optimization. Keep truthful
portraits and square crops; use intrinsic dimensions/aspect ratios for other
images. Set a quantified budget and compare representative mobile/desktop
requests after parent runtime inspection. Do not delete archive originals merely
to reduce repository size.

### F10: P2 - Metadata Does Not Distinguish Several Important Destinations

**Evidence:** [layout.tsx:9](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/layout.tsx:9)
provides a generic default title/description and a large 649,143-byte PNG icon.
The inspected home and `/2025` routes supply no year-specific metadata; no
canonical, Open Graph, Twitter, sitemap, or robots definitions exist in the
inspected route inventory. Current profile metadata also initially inherited the
root title. These are index/share clarity omissions, not proof of a search-ranking
penalty or of a broken deployment URL.

**Fix:** Give current and archived event pages distinct truthful titles,
descriptions, canonical paths, and share images. Keep 2025 archival identity in
metadata. Validate the owner-controlled origin rather than inventing a domain.
Include public canonical routes in a sitemap; avoid indexing transient profile
unavailability as a real person's page. Use appropriately sized icons and keep
the website distinct from the native attendee app.

### F11: P2 - Acceptance Scripts And Tests Can Give False Confidence

**Evidence:** [verify-reviewed-content.mjs:15](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/scripts/verify-reviewed-content.mjs:15)
inserts `Reviewed directory person` as `Approved producer`, then line 43 expects
that unconfirmed name to render. The current allowlist correctly excludes it.
Line 61 also expects a retired exact empty-program string. This script's old
passing results cannot certify the current implementation.

[verify-website-acceptance.mjs:47](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/scripts/verify-website-acceptance.mjs:47)
still locates a button named `Menu` and a link named `Schedule`; concurrent shell
changes name them `Open navigation menu` and `Schedule 2026`. The script strips
fragments at line 38, so an HTTP-200 page with a missing anchor passes its internal
link check. It checks internal links only, not live external destination health.

Unit gaps: host approval is asserted incorrectly (F01); canceled status and
program withdrawal are coupled (F03); highlights tests only render the initial
poster; the initial snapshot test uses the historical demo fixture and does not
exercise API outage freshness. `apps/web/package.json` labels `tsc --noEmit` as
both lint and typecheck, so passing lint is not an accessibility lint pass.

**Fix:** Update tests to obey the new confirmation/role rules, use an actually
allowlisted attendee for positive publication tests, and retain an unconfirmed
name as a negative case. Check actual fragment targets, semantic keyboard flows,
independent status transitions, and image/focus/contrast behavior. Let the parent
run browser acceptance; do not weaken factual gates to satisfy stale tests.

## Editorial And Runtime Follow-Ups

- **Current event policies need explicit provenance:** Current Awards renders
  `Invitation only` at original-event-page.tsx:162 and the entire historical
  no-pitch/no-solicitation policy at line 186. Neither the reviewed ROS nor its
  current fixture establishes those general policies; the fixture explicitly
  leaves access details unconfirmed. Do not call them false without evidence,
  but obtain owner/current-source approval or withhold them on 2026. Preserve
  historical policy text on 2025.
- **Do not call offsite links verified:** Live companion still links to
  `/summit-venue` and `/summit-contact` on ICF at summit/live/page.tsx:73-74.
  Local `/map` and `/contact` already exist. These external paths were not checked
  for HTTP status in this source-only review; prefer approved local destinations
  or ask parent to validate them. Do not falsely report a proven 404.
- **Short-screen hero check:** The 2026 Awards mobile hero has `min-height: 490px`
  plus header/year navigation at original-event-page.module.css:322. It cannot
  leave a next-section hint on a 568px-tall viewport with the existing shell.
  Its 170px top/82px bottom padding and fixed typography also warrant parent
  checks at 320px width, 200% zoom, and large text. This is a specific sizing
  concern, not a recommendation to abandon the 2025 format.
- **Foundation metrics:** The footer reuses the captured ICF mission/statistics,
  including 95% scholarships and 22 cities. They have source provenance and are
  not newly invented here. Do not silently change them or represent them as
  separately reverified 2026 metrics. Retain attribution and seek editorial
  confirmation if presenting them as current annual results.
- **Missing portraits:** The Awards gallery has 16 photos and 30 name-only cards,
  plus five separate approved producers for the inspected fixture. Name-only
  cards are an honest design choice. Do not manufacture photos or expand credits.
- **Public map:** The map explicitly says venue approval is pending, which is
  preferable to fabricated room pins. Parent should verify that any added venue
  guide remains canonical and does not promise accessible routes not supplied.

## Concurrent Improvements Observed

These are other agents' changes, not fixes made by this reviewer. Their final
verification belongs to the parent. The reviewer observed the following improve
during this pass and does not list their original state as still unresolved:

- Header gained Escape/outside/focus dismissal, 44px controls, year-aware links,
  current-page indication, and a bounded scrollable mobile menu.
- Directory gained semantic category anchors, heading nesting, encoded profile
  paths, explicit unavailable gating, and an Awards-context path with no search.
- Snapshot adapter gained event/demo validation, public projection, and reviewed
  attendance filtering. The fallback freshness issue in F04 remains distinct.
- Ask AI endpoint gained malformed/oversized request handling, explicit outage
  responses, dynamic event facts, and attendance-only wording. A local mocked
  probe confirmed changing `venueName` changes its response and asking when Loni
  appears no longer assigns a host/time. Client concerns remain in F07.
- Later in the pass, schedule tabs and the Ask AI client were rewritten and
  re-inspected; see follow-up status under F06/F07. The parent is handling final
  skip-link/main-ID integration after agents finish.
- Contact/donate gained scoped support presentation; manifest now describes a
  public website and uses browser display. Error/loading/not-found and archive
  profile changes were still arriving, so their final behavior is not certified.

## F11 Follow-Up Implemented

The parent explicitly expanded this reviewer's write scope to these files only:

- `scripts/verify-reviewed-content.mjs`
- `scripts/verify-website-acceptance.mjs`
- `scripts/verify-original-sites.mjs`
- This report.

The reviewed-content script now imports the checked-in reviewed 2026 fixture via
the already-installed `tsx/esm/api`, not a production API fetch. Loni Love and
Jason Kennedy are positive attendance-only records; the fixture's approval
categories and role provenance are asserted before the isolated test starts.
An unconfirmed synthetic host and an unpublished confirmed attendee are negative
controls. The checks require current guest cards without inferred host headings,
no public links/profiles for withheld records, no Awards search, no biographies
during directory disablement/outage, and no resurrection after withdrawal.
Isolated biography/program test copy is explicitly labeled as non-production.
No original-site unit files or application code were changed by this reviewer.

Withheld profiles must render `Profile not found`, omit their name/biography, and
include `noindex`. A 200 response is accepted only alongside these assertions,
because the bundled Next documentation permits HTTP 200 for streamed `notFound`
responses; non-streamed 404 remains accepted. HTTP status alone cannot pass.

Website acceptance now uses the current accessible menu names and the stable
`aria-controls` relationship, exercises Escape/focus restoration, includes the
live-companion route, and preserves same-origin relative and hash-only links.
Cross-route query strings remain intact. Each collected fragment must identify
exactly one element in its resolved destination, including skip-link targets.
External destination health is explicitly not claimed by this check.

Original-site acceptance retains every historical name and now also checks
historical affiliations, all original producers in both archives, Awards
descriptions, the historical host, and closed archive registration. It checks
current withdrawn names, no Awards search, separate producer placement, actual
same-page anchor targets, and server readiness. The original-site and website
JSON reports now distinguish failed/partial runs from completed passing runs.

Verification for this follow-up: all three `node --check` commands and scoped
`git diff --check` passed. The local fixture import was checked without starting
an app or browser. **None of the modified browser scripts was executed**; parent
must run them against the final website build. The current-host negative checks
were intentionally expected to fail before the parent's F01 fixes. Those fixes
are now present and pass the focused source/unit re-review below; the acceptance
scripts themselves still require parent-controlled browser execution.

## Focused F01-F03 Re-Review

Reviewed the landed `original-event-page.tsx`, `awards-program.ts`, and their
unit tests at approximately 22:26 local time on September 16. This section
supersedes the original F01-F03 implementation observations above, not the
separate findings or the parent's outstanding browser verification.

### F03 Follow-Up: Summit Canceled-Show RSVP Now Fixed

The parent subsequently added the guard at `original-event-page.tsx:116` and
line 123, plus the cross-page assertion at `original-sites.test.tsx:239`.
The September 16 22:55 targeted rerun passes. The reproduction below records
the gap found in the prior review, not a remaining open defect.

[original-event-page.tsx:121](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/components/original-event-page.tsx:121)
always emits `Awards RSVP` in the current Summit navigation. It does not use
the canonical cancellation check applied to Awards navigation and program
actions at lines 164 and 175. A read-only static-render probe changed **only**
the Awards Show status to `canceled`, leaving the program published: Awards
rendered zero RSVP actions, but Summit still rendered one active external
Awards RSVP action. Visitors entering via the main Summit page therefore still
receive an invitation to register for the canceled show.

**Recommended finishing fix:** Apply the same `publicAwardsShow(snapshot)`
cancellation rule to the Summit's Awards RSVP link. Preserve its Awards detail
link and unrelated Summit actions. Extend the one-field cancellation test at
[original-sites.test.tsx:232](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/lib/original-sites.test.tsx:232)
to render both current pages; leave all archive RSVP behavior unchanged.

### Confirmed Fixes

- **F01 closed in reviewed source/unit scope:** The current Awards host section
  is removed. Current Summit leadership at `original-event-page.tsx:128` is
  explicitly `chairsOnly`; historical host groups remain in 2025. Loni and Jason
  remain confirmed guests, not inferred hosts. Negative tests at
  `original-sites.test.tsx:15` and line 30 exercise this distinction. The earlier
  reviewed-ROS/publication evidence still contains no separate 2026 host approval.
- **F02 closed in reviewed source/unit scope:** Lines 129-133 retain the original
  activities and historical groups only for 2025. Current Summit has one canonical
  directory, current published positioning, a schedule link, and an explicitly
  labeled 2025 image. Its date notice and venue section use the full published
  event label, including additional activities on November 1 and 5.
- **F03's original Awards-page P1 is fixed:** Lines 145-176 display cancellation
  explicitly and suppress the active timetable and both Awards-page RSVP links
  even when the program stays published. No replacement date or cancellation of
  the entire Summit is inferred. The subsequent Summit guard and regression also
  close the cross-page P2 described above.
- **Date floor and rescheduling:** `awards-program.ts:12` and lines 31-34 use the
  show's IANA timezone, not a UTC date slice. The fixture's November 3 UTC start
  correctly renders Monday, November 2 in Las Vegas and selects November 2 pending
  notes. Moving only the show to November 4 at 05:00Z renders Tuesday, November 3
  in both hero and program, with 9:00-11:00 PM. Unmoved Red Carpet is explicitly
  dated November 2; unavailable November 3 doors/pre-show notes become unconfirmed.
- **Pending and publication safety:** Read-only probes confirmed changed doors
  notes replace old program times, removed/unpublished pending notes do not restore
  old times, and private/unpublished/foreign-event Red Carpet rows cannot enter
  the program. The checked-in test named "withdrawn or private" currently tests
  withdrawal/unpublication but not private visibility directly; add the private
  and changed-pending cases to retain this evidence as regression coverage.
- **2025 factual archive preserved:** No diff to `original-sites.json` or
  `content.ts`. Tests retain all 66 Summit and 75 Awards portrait entries with
  names/affiliations, all 18 award descriptions, original host sections, all six
  original producer credits, mission/policy copy, and closed registration.
  Shared main IDs, archive-image alt clarification, and helper extraction mean
  markup is not byte-identical; no historical factual removal was found.

**Verification:** `pnpm --filter @not-alone/web exec vitest run
lib/awards-program.test.ts lib/original-sites.test.tsx`: **2 files, 19 tests
passed**. Additional in-memory Node/tsx static-render assertions checked local
date boundaries, changed pending notes, publication/access filters, and the
remaining Summit RSVP issue. No application/test files were changed in this
re-review, and no browser, acceptance-script execution, or external endpoint
check was performed.

## Published-Update And Program-Answer Sidecar

Read-only application review requested after the F03 follow-up, September 16
at approximately 22:55 local time. Only this report was edited. Isolated mutation
probes below are synthetic test inputs, not new event facts or publication writes.

### S01: P1 - Published Urgent Notices Are Missing From Main Public Routes

The existing portal supports published notices with urgency and effective windows
at `apps/admin/app/content/content-studio.tsx:216`. The public snapshot correctly
retains same-event published notices at `apps/web/lib/snapshot.ts:37`, and
[getActiveOperationalNotices](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/domain/src/index.ts:156)
already combines effective notices with public delayed/moved/canceled sessions,
ordered urgent, change, then information. No new notification service is needed.

However, the only web caller is `app/summit/live/live-state.ts:7`; its output is
rendered by `live-companion.tsx:33`. Schedule receives only grouped sessions and
pending notes at `app/schedule/page.tsx:29`, not `snapshot.notices`. Summit,
Awards, profiles, and the global layout have no operational-notice renderer.
A validated snapshot with one active synthetic urgent notice produces one domain
notice and one live-companion notice, but zero occurrences in either current
Summit or Awards static markup. Reloading those pages cannot reveal it. Session
status labels on Schedule do not substitute for separately published urgent text.

**Minimum fix:** Reuse the shared helper in one small public update strip,
mounted on current-event public routes. Include Schedule and both current marketing
pages, current profiles, and shared current support/venue surfaces; exclude 2025
archives and archived profiles. Keep actual published title/body and severity,
not rewritten instructions. Preserve publication windows, same-event projection,
and public session visibility. Do not interpret `eligibilityScope` as a grant of
access. A generic `/schedule` link is valid; there is no stable session-fragment
contract in the present Schedule markup to invent a deep link against.

**Accessibility gap on the existing live page:** Its notice section is not a live
region; only the unrelated program-status text has `role="status"`. A newly
published urgent notice need not be announced when that status stays unchanged.
The shared strip should announce new/changed urgent text assertively and routine
changes politely, without focus theft or repeating identical text every poll.

### S02: P2 - Portal Updates Do Not Refresh Open Current Pages

[use-publication-refresh.ts:6](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/apps/web/app/schedule/use-publication-refresh.ts:6)
already implements 60-second visible-page refreshes, hidden-tab suspension, and
a 15-second resume/focus throttle. Only `ScheduleBrowser:32` and
`LiveCompanion:24` call it. Current Summit/Awards and profile pages fetch on server
render but never request another render while the visitor stays there. Consequently
a guest withdrawal, disabled directory, show cancellation, corrected biography,
or newly published notice can remain stale indefinitely in an open page.
`force-dynamic` is not a client subscription. The `no-store` snapshot fetch at
`snapshot.ts:52` prevents reuse on a new server request but does not cause one.

**Minimal shared component design:**

1. A route-level `PublicEventUpdates` client component receives the same sanitized
   snapshot/freshness and server initial time already used by that page. It owns
   the existing refresh hook and the existing event-clock hook; the domain helper
   remains the sole notice selector. It returns no notice markup for an empty list,
   but keeps refresh mounted. No separate API, stored notice copy, notification
   center, dismissal persistence, push, or realtime subscription is required.
2. Mount it exactly once per current route, including unavailable/disabled states.
   Retain it at a current-profile boundary even when the profile becomes not-found;
   a missing profile must not silently disable future publication recovery. Remove
   duplicate timer ownership from Schedule/Live when adopting the shared wrapper.
   Reuse an existing page snapshot instead of doing a second independent fetch.
3. Keep current notices and polling out of 2025 routes and `2025-` profile slugs.
   Do not put an unconditional current-event fetch into the root layout, which
   would couple historical pages to present availability. For otherwise static
   current support pages, a thin current-event server wrapper can supply the same
   published snapshot and strip without changing their main content.
4. Preserve the existing visible 60-second and focus/visibility contract. The
   bundled Next `use-router.md` confirms `router.refresh()` merges server output
   while retaining unaffected client state; `no-store` supplies the fresh read.
   This is bounded polling, not an instantaneous delivery guarantee. Parent must
   verify search selection, scroll, focus, and open video state survive refresh.
5. On unavailable publication, never label the bundled fallback's absence of
   notices as "no current alerts" or treat old bundled alerts as verified current.
   Retain the explicit unverified-source notice. Clock-driven start/expiry checks
   should continue without requiring an unrelated interaction.

**Shared-helper boundary note, P3:** `index.ts:162` compares ISO strings instead
of instants. With valid `endsAtUtc="2026-09-17T02:00:00Z"` and
`nowUtc="2026-09-17T02:00:00.000Z"`, the expired notice is still included because
the strings sort differently. A direct probe reproduced it. Numeric instant
comparisons would preserve the documented exclusive end boundary across allowed
ISO precision. Web projection already removes foreign-event notices; keep that
protection when wiring the shared component.

### S03: P1 - Stale Pending Notes Override A Canceled Canonical Activity

[attendee-concierge.ts:103](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/domain/src/attendee-concierge.ts:103)
returns a matching day's pending body before examining a fully timed matching
activity. `published-program-answer.ts:21` preserves that body unchanged.

**Exact reproduction:** Keep the reviewed November 2 pending page published and
add an isolated, same-event, public, published `Doors Open` item with status
`canceled` at 6:30-7:30 PM. `POST /api/ask-ai`, question `When do doors open?`,
returns HTTP 200 with `Doors Open: 6:30 PM; end time to be confirmed.` and no
cancellation. The same branch can preserve an old start time after a complete
timed row supersedes the pending note. This is the same independent-publication
failure mode repaired for Awards copy, now reachable through the new adapter.

**Minimum fix:** In the shared interpreter, prefer the current published matching
activity and its status over a pending-note line for that activity/day. Use pending
copy only when no complete matching public record supersedes it. Do not cancel
other activities merely because Awards Show is canceled. Add canceled, moved-time,
private/unpublished replacement, and unchanged genuine-pending test cases.

### S04: P2 - Performer Questions Return The Attendance Roster

With the unmodified reviewed fixture, `Who is performing at the awards?` takes
the shared `who` branch at
[attendee-concierge.ts:167](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/domain/src/attendee-concierge.ts:167).
The API returns all **51** published guest names followed by the timed Awards
Show. The domain title `Confirmed 2026 guests` is discarded by the web adapter,
so the first visible text is a bare list answering a performer question. A later
attendance/speaking-time caveat does not identify an approved performer lineup,
and the reviewed Awards copy explicitly says that lineup is unconfirmed.

**Minimum fix:** Distinguish requests for performers, hosts, honorees, or appearance
assignments from general guest-list questions before the broad `who` branch.
Only separately published role/appearance evidence may answer those requests;
otherwise state that the requested lineup is unconfirmed. Do not produce the
attendance roster as a substitute. Preserve explicit attendance-only guest answers.

### S05: P2 - Canceled Appearance Still Gets Affirmative Narrative

[attendee-concierge.ts:76](/Users/sethwinterton/Documents/Codex/2026-08-31/files-mentioned-by-the-user-not/packages/domain/src/attendee-concierge.ts:76)
uses any matched item to say the person `appears in the loaded schedule below`.
Its matching input includes canceled sessions. The web adapter marks item status
correctly but cannot repair the contradictory affirmative body.

**Exact isolated route reproduction:** Give the published Awards row the synthetic
summary `Loni Love hosts the Awards Show.` and change only its status to `canceled`.
Ask `When is Loni appearing at the awards?`. The alias bypasses the route's
full-name attendance branch and returns `Loni Love appears in the loaded schedule
below.` followed by `Awards Show (canceled)` and its old time. This is not evidence
that Loni has an approved host role; the summary is deliberately isolated test
copy. The purpose is to verify withdrawal of a previously published appearance.

**Minimum fix:** Make the shared named-appearance narrative status-aware. A
canceled record may remain visible as a cancellation but must not establish an
active appearance. Cover both `speakerIds` and name/alias matches, and mixed
canceled/active records. The new word-boundary fix itself passes Jewel/jewelry
tests; it does not address cancellation semantics.

### S06: P2 - Non-Name Substring Matching Still Misroutes Program Questions

The web `programIntent` is word-bounded, but the shared `matchesAny` at
`attendee-concierge.ts:363` still uses substring matching. With the actual fixture,
`Do you know when the awards start?` matches `now` inside `know` at line 110 and
returns Mike's Bikes Community Ride plus the next two November 1 activities,
not the November 2 Awards Show. This also reproduces through HTTP 200 from the
mocked API route. The newly added generic schedule branch cannot correct it
because this earlier branch wins.

**Minimum fix:** Apply phrase/word boundaries to program intent selection and
prefer explicit named activities over generic current/next wording. Keep partial
text search where it is actually intended for matching session titles; do not
replace all substring searches indiscriminately. Add the exact natural-language
question above and a true `What is happening now?` control.

### Passed Checks And Finishing Gates

- Generic `What is the schedule?` now correctly reports **26** timed activities
  and explicitly limits the displayed list to the first eight. It no longer
  substitutes event positioning. Canceled entries in this generic list carry a
  cancellation label in the web adapter; they are not selected as upcoming.
- Adapter items are rechecked for same-event/public/published state, use event-local
  full dates and timezone-aware times, show overnight end dates and access labels,
  and do not invent durations for the original incomplete ROS rows. Name matching
  no longer interprets `jewelry` or `Jewelry workshop` as Jewel.
- `pnpm --filter @not-alone/web exec vitest run lib/published-program-answer.test.ts
  app/api/ask-ai/route.test.ts app/schedule/use-publication-refresh.test.ts
  app/summit/live/live-state.test.tsx lib/original-sites.test.tsx`: **5 files,
  61 tests passed**. Domain concierge and schedule tests: **2 files, 24 tests
  passed**. These passing suites do not cover the new counterexamples above.
- Read-only Node/tsx probes exercised the helper, static current marketing markup,
  and the actual API route with an in-memory mocked fetch. Four mocked publication
  reads, zero external requests, zero published changes. No browser was run.
- Parent integration gates: active/future/expired/withdrawn notices across all
  current routes; public versus hidden sessions; canceled/moved auto-notices;
  unavailable/recovered publication; exactly one visible-page refresh timer;
  unchanged filters/scroll/video/focus; current profile withdrawal/recovery;
  no current-year alert or polling leakage into archives; keyboard/screen-reader
  delivery without repetitive announcements. Retain canceled-show RSVP tests.

## Verification Performed

- `pnpm --filter @not-alone/web test`: **7 files, 34 tests passed**, initial review
  snapshot, September 16 at 22:14 local time. This does not represent the later
  concurrently edited tree or full workspace gates.
- Later rerun at 22:18 local time: **19 files, 171 tests; 170 passed, 1 failed**.
  `app/schedule/schedule-presentation.test.tsx:99` expects the literal HTML
  `aria-selected="true" tabIndex="0"`, but React renders lowercase `tabindex`.
  The actual static markup has the correct selected-tab index. This is a stale
  serialization assertion, not proof that the implemented tab behavior is wrong.
  Line 106 also expects `<time dateTime=`, which merits the same casing check.
  Reported to the parent; not edited outside this reviewer's document scope.
- Document validation: 26 local Markdown link targets existed; ASCII-only source;
  `git diff --check -- docs/WEBSITE_INDEPENDENT_AUDIT_2026-09-16.md` was clean.
- Read-only Node/tsx probes: actual reviewed fixture counts; historical-group
  filtering; actual React static render with CSS imports stubbed solely for the
  source probe; independently canceled Awards status; live phase on November 5
  and empty publication; mocked API outage; changed-venue/attendance-only Ask AI
  answers; filesystem asset sizes/existence; solid-color contrast arithmetic.
- Browser/Playwright, external link responses, embedded video playback, computed
  responsive layout, screen-reader behavior, production build, repository-wide
  lint/typecheck/tests, native inspection, and deployment were **not run by this
  reviewer**. Existing QA documents describe earlier runs, not this audit's proof.

## Finishing Checklist

- [x] F01: Source/unit re-review confirms attendance-only guests, no inferred 2026
  host assignments, and preserved historical hosts.
- [x] F02: Source/unit re-review confirms one current directory, no historical
  activity/group imports, and complete 2025 factual archive preservation.
- [x] F03: Cancellation/rescheduling is fixed in Awards, the canceled-show Summit
  RSVP is suppressed, and the cross-page one-field regression passes.
- [ ] F04-F05: Label offline schedule freshness; distinguish pending, empty, live,
  and completed companion states; retain five-day canonical schedule notes.
- [ ] F06-F08: Verify keyboard tabs, play/close focus, labeled/announced AI states,
  contrast, reduced motion, skip navigation, and no clipped short-screen content.
- [ ] F09-F10: Optimize delivered images/icons without losing source provenance;
  verify year-specific metadata, canonical links, sitemap, and share images.
- [ ] F11: Repair stale acceptance fixtures/selectors; check fragment targets and
  failure scenarios as well as successful route rendering.
- [ ] Confirm 2026 policies and every active external destination; no fabricated
  host, appearance, honor, room, access entitlement, biography, or new sponsor.
- [ ] Preserve 66 original Summit portrait entries, 75 original Awards portrait
  entries, all 18 award descriptions, and all six original producer credits in
  2025. For the reviewed current fixture, retain 46 Awards guests plus five
  separate confirmed producer credits below them; no Awards search.
- [ ] Parent reruns `pnpm lint`, `pnpm typecheck`, `pnpm test`, website build, and
  its controlled browser matrix after all concurrent edits settle. Report exact
  results and limitations; do not infer production or native release readiness.
