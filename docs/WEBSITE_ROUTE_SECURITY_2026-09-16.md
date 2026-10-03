# Website Route Security Review - 2026-09-16

## Scope And Method

Source-only review of the current owner-authorized working tree. The website
directly consumes the admin `/api/snapshot` endpoint through
`apps/web/lib/snapshot.ts:50`, and its browser posts to its own `/api/ask-ai`.
The device, notification and staff endpoints below are adjacent public HTTP
surfaces on the admin service, not requests made by the current website UI.

Public snapshot projection and admin attendee-AI remediation are covered by
Gibbs and the main task. Those findings are not duplicated here; see
`PUBLIC_SNAPSHOT_SECURITY_2026-09-16.md`. The main task's attendee-AI fallback
projection is not counted as another new unresolved finding in this report.
Root/web agent instructions and the bundled Next authentication guide's route
handler authorization guidance were read. No browser, network, credential-file
inspection, real registration, email, push, form submission, database operation,
deployment or production write was performed. The initial review was
documentation-only. The owner subsequently authorized the two narrowly scoped
route/authentication fixes and offline regression tests recorded below. No
schema, migration, native-app, dispatch-worker or configured staff-role policy
changes were made.

**Current status:** RS01 and RS02 are resolved in the local working tree and
verified offline. Neither fix has been deployed by this task. The pre-fix source
locations and reproduction results below are retained as historical evidence;
the local remediation paragraphs describe the current behavior.

## Findings

### RS01 - P1: Anonymous Device Registration Grants Private Push Membership

**Status:** Resolved locally, not deployed. Originally reproduced with an
in-memory backend stub and reported to the parent.

**Pre-fix evidence:**

- `apps/admin/app/api/devices/register/route.ts:13` accepts an unauthenticated
  POST. Lines 28-42 perform schema validation and call `registerDevice`, without
  authenticating an attendee or authorizing group membership. The rate limit
  does not impose an audience authorization rule.
- `packages/validation/src/index.ts:269` validates the UUID/token/platform shape,
  but line 277 allows any array of nonempty `audienceGroups` strings.
- `apps/admin/lib/live-ops-repository.ts:663` copies the caller's groups into
  `audience_groups` at line 673. Its backend helper at lines 717-721 supplies the
  service-role credential. Database RLS therefore is not checking this caller's
  group entitlement. The registration table's `audience_groups text[]` has no
  membership constraint (`supabase/migrations/202609030001_live_ops_architecture.sql:105`).
- `apps/admin/lib/push-dispatcher.ts:301` matches private job scopes directly
  against those persisted strings. Lines 105-125 use that match to select a
  device and construct a push containing the session title, location, start
  time and identifier. `push-dispatcher.test.ts:18` explicitly distinguishes
  the private `founders` audience from `vip`.

**Pre-fix reproduction performed, entirely offline:**

1. Import the actual device POST handler and `deviceMatchesAudience` in a clean
   process. Set only fake backend configuration using `https://offline.invalid`.
2. Replace `globalThis.fetch` with an in-memory stub that asserts every requested
   origin is that invalid test origin. Capture the registration insert; return
   a fixture revision and empty arrays for the subsequent state reads.
3. Call the handler directly with a `NextRequest`, no cookie or Authorization,
   a fixture event ID, a synthetic valid UUID, the nonfunctional token
   `ExpoPushToken[offline_only_not_a_real_token]`, and
   `audienceGroups: ["founders"]`.
4. Assert HTTP 200, `ok: true`, captured `audience_groups: ["founders"]`, and
   `deviceMatchesAudience(capturedRow, "founders") === true`. All assertions
   passed. All eight backend calls were intercepted; nothing was persisted or
   sent. No dispatcher/provider-send function was invoked by this reproduction.

**Pre-fix impact and preconditions:** An unauthenticated caller with an attacker-owned
working Expo token can enroll it for an arbitrary private audience. If a matching
job is subsequently dispatched through the authorized, enabled delivery path,
that device is eligible to receive the restricted notification. Registration
does not require the delivery flags to be enabled, so an unauthorized enrollment
can precede enablement. This is not a claim that push is currently enabled,
that a private job currently exists, or that a live notification was leaked.
The incident policy classifies wrong-audience notification delivery as P1
(`docs/INCIDENT_RESPONSE.md:6`). No device-ID guessing is required for this path.

**Local remediation:** `apps/admin/app/api/devices/register/route.ts:43` now
rejects any requested audience outside the exact public values `public` and
`all_attendees`, with HTTP 403 and a generic no-store/CORS-compatible error,
before calling the repository. Mixed public/private arrays and unknown scopes
are rejected rather than partially accepted. The current app's `["public"]`
payload, the public alias and the existing empty-array behavior remain valid;
none grants a private audience. This endpoint does not create a new privileged
registration flow or enable delivery.

The real-route tests exercise the actual repository for accepted public
registrations with every backend call intercepted. Rejected private enrollment
causes zero backend calls. Existing registrations were not inspected, removed
or modified; this change prevents new anonymous private enrollment but does not
assert that historical records have been cleaned up.

### RS02 - P1, Deployment-Conditional: Missing Backend Config Disables Staff Auth

**Status:** Resolved locally, not deployed. The original production-mode
authorization bypass was reproduced offline and reported to the parent.
Deployed configuration was not inspected.

**Pre-fix evidence:**

- `apps/admin/lib/live-ops-repository.ts:313` returns a local staff context when
  `hasSupabaseServerConfig()` is false, before inspecting credentials.
- That configuration check at line 751 only tests for a backend URL and service
  key. It does not require a development environment or a loopback request.
  `parseLocalRole()` at line 769 defaults to `ADMIN` when unset or invalid.
- `hasStaffPageAccess()` at line 373 also returns true in this mode.
  `apps/admin/app/api/staff/session/route.ts:37` returns a successful local role
  from its refresh handler without requiring a session in the same condition.
- `apps/admin/app/api/live-ops/state/route.ts:7` relies on that authorization
  helper before returning draft sessions, notification jobs, activity logs and
  import metadata. Those fields are not limited to the published website model.
- `apps/admin/app/api/live-ops/draft/route.ts:21` likewise trusts the helper before
  saving. `live-ops-repository.ts:124` accepts its `ADMIN` role and falls through
  to the local adapter. `apps/admin/lib/live-ops-store.ts:235` writes the new
  draft to the local store. The analogous `publishEventContent`, `publishDraft`
  and `rollbackPublishedRevision` repository paths accept the same context.

**Pre-fix reproduction, without reading or changing the local store:** In an
`env -i` process with `NODE_ENV=production`, no Supabase URL/key and no local role,
create `new NextRequest("https://offline.invalid/api/live-ops/state")` with no
credentials. Calling `getStaffContext(request, ["ADMIN"])` returns exactly
`{ role: "ADMIN", mode: "local-adapter" }`. With fake backend URL/key configured,
the same request instead rejects with status 401 before any fetch. Both results
were asserted. The fetch replacement throws on any attempted network operation
in this part of the check.

**Pre-fix impact and preconditions:** If the admin service is publicly reachable without
complete backend configuration, anonymous callers pass the staff authorization
gate. A readable local store exposes staff draft/import/audit data, and a
writable store permits unauthorized draft/publication changes. A read-only or
absent unusable store can prevent those operations, but does not restore the
authentication boundary. With complete backend configuration, the tested
anonymous request is denied. A backend outage while configuration remains
present does not take this unauthenticated branch.

The local adapter is documented as a development facility
(`docs/STAFF_OPERATIONS_RUNBOOK.md`, Local Adapter). The defect is its automatic
activation outside that environment, not the existence of a local adapter.
This finding does not assert that the deployed admin service is misconfigured
or that any Supabase production records were changed.

**Local remediation:** `getStaffContext` and `authenticateStaffAccessToken` now
share `getLocalStaffContext` in `apps/admin/lib/live-ops-repository.ts:770`.
With `NODE_ENV=production`, missing backend configuration raises a typed 503
with only `Staff access is temporarily unavailable.`; it never grants a local
role. `hasStaffPageAccess` returns false under the same condition. Staff session
refresh now uses the same authentication gate, returns 503 and clears the
session cookies instead of reporting local ADMIN success. Session exchange
likewise cannot issue a session when this configuration gate fails.

Development/test local adapter operation and its existing role checks remain
available. Configured Supabase authentication, invited-staff ADMIN activation
and production session-cookie protections are unchanged. The tests assert denial
before any local store, readiness-file, database or provider access.

## Other Examined Boundaries

These are bounded source observations, not assertions of complete security:

- **Retired website submissions:** `apps/web/app/api/messages/route.ts:3` and
  `apps/web/app/api/tickets/route.ts:3` return constant HTTP 410/no-store responses
  without reading the body, calling providers or writing state. Two regression
  tests verify no fetch even with fake legacy webhook configuration. The ticket
  migration enables RLS and revokes execution of `reserve_summit_ticket` from
  `public`, `anon` and `authenticated`; deployed migration state was not checked.
- **Arbitrary URL input:** The website snapshot fetch target comes from server
  configuration, not a request parameter. Ask AI accepts a question, not a fetch
  URL. Profile retry paths encode the slug and compare `from` to the literal
  `awards`; alias redirects are fixed paths. Archived images use the pinned
  asset map. Remote portrait URLs render as browser images, not a website
  server-side URL-fetch endpoint; the Next config declares no remote image
  allowlist. No request-controlled server fetch or open redirect was evidenced
  in these paths. External destination services themselves were not visited.
- **Website Ask AI:** The request reader bounds the streamed body to 8192 bytes
  and five seconds and validates a trimmed 2-500 character question. The handler
  returns only an answer, uses no paid AI provider or write path, and returns
  generic no-store validation/unavailable errors. Snapshot-content and admin
  attendee-AI authorization remain Gibbs's separately reviewed scope.
- **Configured staff endpoints:** Live-ops state/preview, notification jobs,
  production readiness, staff identity and state AI call `getStaffContext` before
  privileged reads. Draft/import/operator-AI routes require editor-or-higher;
  publish/content/rollback/dispatch/receipts require publisher-or-higher. The
  repository repeats mutation role checks. These handlers share RS02's now-fixed
  authentication gate; the repeated role checks are not a second independent
  authentication mechanism. Ten staff page entry points also check
  `hasStaffPageAccess` before reading state, rather than relying on layout-only
  authorization.
- **Staff policy:** Automatic ADMIN activation of invited staff and existing
  staff profiles is explicit in `docs/STAFF_OPERATIONS_RUNBOOK.md:5`,
  `staff-access.ts` and its tests. It is not reported as a new lower-role
  escalation defect. In configured mode an uninvited user without a staff
  profile is rejected. Sign-in requests use `create_user: false`; production
  session cookies are HttpOnly, Secure and SameSite Strict.
- **Notification sending:** Staff dispatch/receipt handlers require staff auth,
  both delivery flags and Supabase mode. The cron GET requires a configured
  `CRON_SECRET` and exact matching bearer value, then both delivery flags and
  Supabase mode. No unauthenticated direct-send path was evidenced. Those guards
  remain unchanged; RS01 is corrected at the earlier registration boundary.
- **Other public output:** `/api/health` returns backend mode, event ID and health
  status, or a generic 503, not the staff state it internally reads. Device
  registration responds with mode and aggregate device count, not tokens or
  staff records. These output observations are separate from the fixes above.

## Changed Paths

- `apps/admin/app/api/devices/register/route.ts`: public audience allowlist and
  rejection before writes.
- `apps/admin/app/api/devices/register/route.test.ts`: 17 offline cases covering
  private/mixed/unknown rejection, public persistence, validation, rate limiting
  and preflight.
- `apps/admin/lib/live-ops-repository.ts`: production missing-config auth gate,
  503 auth error support and page-access denial only; no storage/projection or
  configured-account policy edits.
- `apps/admin/lib/live-ops-auth-fallback.test.ts`: 25 cases covering missing and
  partial configuration, every staff handler, page access and development/test
  compatibility. The 16 real handlers are each checked with anonymous, invalid
  bearer and invalid cookie requests.
- `apps/admin/app/api/staff/session/route.ts`: shared gate in the local refresh
  branch and generic unavailable response with cleared cookies.
- `apps/admin/app/api/staff/session/route.test.ts`: eight cases for unavailable
  production configuration, development/test sessions, invited ADMIN activation,
  configured refresh and invalid access tokens.
- `docs/WEBSITE_ROUTE_SECURITY_2026-09-16.md`: findings, evidence and local
  resolution record.

## Verification And Limits

- **66/66 focused admin tests passed:** the three new suites above plus
  `lib/live-ops-auth.test.ts`, `lib/staff-access.test.ts`,
  `lib/push-dispatcher.test.ts` and `lib/public-api-cors.test.ts`.
  Backend/provider calls are mocked; local store and readiness-file access are
  forbidden by sentinels in the missing-config route tests.
- **29/29 website API tests passed:** `app/api/submissions.test.ts` and
  `app/api/ask-ai/route.test.ts`. Snapshot/provider access is mocked; the tests
  explicitly reject unexpected external fetches.
- The pre-fix findings were additionally checked by direct imports using
  `node --import tsx` in a clean environment. RS01 used the actual handler with
  eight in-memory backend responses. RS02 exercised only the authorization
  helper; local store reads/writes were deliberately not invoked.
- Before the fixes, 48 additional direct route checks confirmed that all 16
  configured staff handlers rejected anonymous requests and invalid bearer or
  cookie credentials; four cron guard checks and two session guard checks also
  passed. All identity lookups were stubbed, with no privileged data endpoints
  reached. No additional independent route-auth defect was evidenced there.
- Admin `tsc --noEmit` passed, as did whitespace checks on the implementation
  changes. Tests were run with the specified bundled runtime PATH and local
  Vitest binaries. Total focused tests after the fixes: **95 passed**.
- No production credentials, deployment configuration, database grants as
  deployed, private attendee records, live device tokens or actual push delivery
  were inspected. No assertion of live exploitability, exploit history or full
  website/backend security is made. Full workspace suites and the admin build
  were not run in this bounded check; the existing readiness suite and build
  launcher read root credential configuration. No browser was used. Parent
  integration/build verification remains separate.
