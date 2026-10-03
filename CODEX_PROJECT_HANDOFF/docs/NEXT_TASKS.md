# Next Tasks

Perform these in order. Each item requires evidence before moving to the next.

## 1. Establish a Verified Staging Baseline

- Record deployed commit IDs, Vercel project/environment names, Supabase migration state, API URL, Expo project identity, and custom-domain/DNS status without exposing secret values.
- Compare the deployed published snapshot revision with expected 2026 content.
- Inspect RLS with realistic unauthenticated, attendee, viewer, editor, publisher, and admin cases.
- Confirm former collaborator access is removed and revoke/replace the reported shared GitHub token.

**Done when:** a dated staging evidence record proves service identities, migration/RLS state, and least-privilege access.

## 2. Reconcile and Publish Approved 2026 Content

- Review every incomplete ROS timing/detail with the owner/source owner; leave unknown data pending.
- Reconcile the Awards pre-show discrepancy (7:00 local UI versus old 7:30 canonical note) in the canonical staff workflow.
- Verify 2026 people, roles, images, awards, sponsor/foundation wording, venue language, and links before publishing.
- Keep 2025 archive content intact and provenance-labelled.

**Done when:** an authorized revision is published, audited, and identically rendered by staff preview, mobile, and public web where intended.

## 3. Prove End-to-End Event Operations

- On staging, create a draft, edit content, publish, verify mobile/web update, test rollback, and inspect audit entries.
- Test device cache: valid snapshot refresh, malformed response rejection, offline app start, reconnect, and revision change.
- Test staff login/session behavior and reassess the all-admin auto-activation policy.

**Done when:** the full staff-to-attendee path is observed and recorded on a physical iPhone/development build.

## 4. Finish Public Website Operations

- Establish ownership and requirements of the external RSVP system or replace it through an approved, owned workflow.
- Verify RSVP statuses, required phone field, access by relevant team members, privacy notice, retention, and outreach reporting.
- Add only approved content/media; do not invent Awards talent, leadership, streams, or schedule details.
- Verify responsive routes, navigation/back behavior, links, SEO/accessibility, image performance, and production deployment.

**Done when:** all public submissions and calls to action have an owner, privacy path, receiver, and tested user journey.

## 5. Activate Push and AI Only When Credentials Are Ready

- Obtain explicit owner authorization, Apple/APNs/EAS setup, and physical-device test plan before enabling push delivery.
- Test notification schedule, retries, receipts, cancellation, deep links, and failure behavior.
- Confirm AI billing/credit and feature configuration, run grounded evaluations, and keep AI unable to directly publish production data.

**Done when:** provider evidence and physical-device results are recorded, with safe disable/fallback behavior proven.

## 6. Release Preparation

- Complete App Store metadata, privacy policy/support URL, reviewer notes, icons/splash, signing, TestFlight, accessibility and final acceptance.
- Re-run required quality gates and inspect native iOS, staff portal, website, RLS, and operational runbooks.
- Do not label release-ready while any P0/P1 remains known.
