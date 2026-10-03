# Public Snapshot Security Boundary

This is a local source change, not a deployment or production-data modification.

## Public Reads

The anonymous admin `/api/snapshot` response now passes through
`apps/admin/lib/public-snapshot.ts`. The existing `EventSnapshot` JSON envelope,
event identity, revision, public session IDs and fields, server clock, no-store
policy, and CORS behavior remain intact. The helper does not change stored staff
state, drafts, publication history, publishing, or notification jobs.

Only published, current-event sessions with `visibilityScope.id === "public"`
are returned. Eligibility is not visibility: a publicly listed founders-only
activity remains visible with its eligibility restrictions unchanged. Current
event locations remain available, including unreferenced venue essentials,
because the snapshot location model has no independent visibility flag.

The directory requires `directoryEnabled`, published current-event records, and
the reviewed 2026 confirmed-name list. Editorial `roleSource` is omitted. Hidden
speaker references and corresponding featured-person entries are removed.
Unpublished FAQ, sponsor, media, notice, and content-page records are omitted;
foreign-event notices and locations are omitted. Empty publications stay empty.

The attendee-only OpenAI helper applies this projection before building model
input and uses the same public session set when resolving returned IDs. Staff
AI state and proposal behavior is unchanged. Tests stub the model provider; no
model request is necessary for verification.

Current local status, verified September 17: the anonymous
`apps/admin/app/api/ai/attendee/route.ts` applies `projectPublicSnapshot` before
both the deterministic fallback and model path. Degraded state disables the
directory and adds an explicit offline warning; shared concierge logic also
filters by event identity. The earlier remaining-integration note is superseded
by existing local code and passing regression tests. This does not prove deployment.

The degraded-adapter warning header remains present when appropriate, but no
longer contains backend exception details. Degraded responses still return the
public subset. Web consumers use the header to distinguish unavailable current
information. Mobile parsing and same-revision replacement remain compatible.
Previously downloaded offline caches cannot be remotely erased by this patch.

## Local Store Preview

`scripts/sync-local-store-from-published.mjs` is now read-only. The anonymous API
is a public subset, never a complete staff backup or restoration source.

The existing `--expected-local-revision=<revision>` preview checks remain. The
preview reports local/public counts and zero writes, and rejects degraded API
responses. `--apply` fails before reading the local store or requesting public
data. It cannot replace staff drafts, history, notification jobs, or the complete
published store. No replacement credential workflow has been introduced.

## Verification And Limits

Focused unit tests exercise the actual snapshot route with a stubbed repository,
the actual attendee AI serializer with a stubbed model provider, the shared
snapshot schema, and the existing mobile same-revision selection function. The
local-sync tests mock filesystem and network dependencies and assert zero writes.

No network, production, paid model, push, database, native-app, commit, or deployment
operation is required or performed by these tests. Public location confidentiality
would require explicit location-level publication/visibility evidence; this patch
does not guess which reviewed venue locations should be removed.
