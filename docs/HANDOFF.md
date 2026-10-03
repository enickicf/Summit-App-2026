# Project Handoff

## Emergency Continuity (September 18)

Temporary Codex -> Claude Code transfer, not restart/rebuild. Latest Summit cleanliness and portrait/shared-founder requests are implemented locally; no unfinished feature is actively authorized. Next action: bootstrap -> actual code/Git inspection -> owner's next instruction. CURRENT_WORK captures exact stopping point, PROJECT_STATE dated verification, PRODUCTION_GUARDRAILS safety, DEPLOYMENTS_AND_PORTALS/ACCESS_AND_AUTH live identity and secure reconnection. Existing sections below remain operating context, not authorization to act.

Awards approved aesthetic stays; Summit now has centered six-link navigation, plum/pearl/mint/video hero, compact curated gallery and separate Partners/Venue pages. Source display grouping never merges canonical people. Additional partner logos blocked by Airtable access. Canonical content, physical-device publish/push, RLS/config, RSVP privacy/ownership and Apple release remain incomplete. All dirty source is intended state; no deployment or publication for recent UI work. The portable copy excludes secrets/private datasets/raw Git history; originals remain authoritative.

## Purpose

This repository is the owner-controlled Not Alone Summit platform: native iOS attendee app, staff operations portal/API, and public Summit/Awards website. The objective is a reliable cloud-backed event operation, not merely a visual prototype.

The active development task supersedes the retired conversation; that conversation is never required for continuity. Read [the September 17 local baseline](LOCAL_BASELINE_2026-09-17.md) for the exact working-tree inventory, current verification, commit exclusions, and recovery recommendation. `CODEX_PROJECT_HANDOFF/` is a frozen archive; current repository documentation and verified service state supersede its dated statements.

## First 20 Minutes in a New Task

1. Read `AGENTS.md` and all documents listed there.
2. Run `git status --short`; treat existing modifications/untracked files as potentially owner-authorized. Do not clean or reset.
3. Identify the requested surface: mobile, admin/API, public web, shared domain, migration, or external service.
4. Read related tests and the current implementation before editing.
5. For an external-state request, inspect the exact target first and state what will change. Do not use credentials from chat or expose them.

## What Is Safe to Work On Without External Credentials

- UI, accessibility, responsive behavior, tests, documentation, typed contracts, fixtures, parsing/validation, local development flows, and static historical content with confirmed provenance.
- Continue refinement only where requirements/data are confirmed; retain placeholders for unknown facts.

## What Requires Targeted Verification or Authorization

- Deployments, Vercel environment changes, Supabase migrations/policies/data, Airtable writes, mobile builds/OTA, Apple/EAS/APNs, production push, provider billing, external submissions, DNS, credentials, and paid services.
- Any action that could publish a revision, notify attendees, change staff access, modify RSVP responses, rotate a token, delete data, or affect App Store state.

## Repository Landmarks

- Mobile snapshot/cache: `apps/mobile/lib/mobile-api.ts`, `apps/mobile/lib/snapshot-sync.ts`, `apps/mobile/components/summit-context.tsx`
- Staff repository/publish path: `apps/admin/lib/live-ops-repository.ts`
- Public website snapshot/read model: `apps/web/lib/snapshot.ts`
- Public site pages/components: `apps/web/components/original-event-page.tsx`, `apps/web/components/site-header.tsx`
- Original historical content: `apps/web/lib/original-sites.json`, `apps/web/public/original-2025`
- Awards editorial logic: `apps/web/lib/awards-editorial.ts`
- Shared data contracts: `packages/validation`, `packages/domain`, `packages/api-client`
- Schema/policies: `supabase/migrations`

## Key Truths to Preserve

- Keep current 2026 event facts read-only from approved Airtable/exact owner direction; never infer missing details.
- Keep 2025 historical material distinct and preserve original ICF contributor/producer credit constraints.
- Do not reintroduce demo mode or personal schedule.
- Do not merge collaborator content or access assumptions. The owner has requested separation.
- Never state a deployment, physical-device path, push service, or credential setup is live unless it was inspected in that task.

## Completion Standard

For code: add focused tests, run applicable gates, visually inspect the relevant surface, and record any remaining risk. For production operation: include an audit path, rollback behavior, and direct evidence of the actual deployed state.
