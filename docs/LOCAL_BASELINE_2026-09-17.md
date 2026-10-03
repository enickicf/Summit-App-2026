# Local Development Baseline - September 17, 2026

Status: **IMPLEMENTED - local verification passed; production release acceptance remains PARTIAL.**

This active task replaces the retired conversation. Current repository documentation, source, and directly verified external state provide continuity; the old conversation is not required. `CODEX_PROJECT_HANDOFF/` is a preserved archival snapshot, not a second set of continuously maintained documents.

## Scope and Preservation

The initial inventory was captured at **2026-09-17 22:10:30 UTC** before documentation edits. No application code, original generated files, private configuration, operational data, Git index, branch, or commit was changed by this baseline task. Only the documentation changes listed below were made in the original repository. Nothing was staged, committed, pushed, deployed, published, seeded, reset, deleted, or sent to attendees.

SHA-256 fingerprints cover all 609 initially tracked or non-ignored untracked files, plus private integrity checks for `.env` and `work/live-ops-store.json`. Verification ran in a separate source copy with separately copied installed dependencies. No credentials, local operational store, device storage, or existing build output were copied into the verification environment. Test/build output was confined to that copy and this task's scratch folder.

## Git Inventory

- Repository: `porterthevibecodegoat/Summit-App-2026`.
- Branch: `codex/awards-2026-polish`.
- HEAD: `a60ba26ce4cc70e11f54cb150d5777bcaebdb03f`.
- Initial state: **65 modified tracked files, 117 individual untracked files, no staged changes or conflicts**. The earlier short status displayed 101 untracked entries because it collapsed directories.
- Final state after this documentation update: **66 modified tracked files, 118 individual untracked files**. Existing changes were retained.

| Initial area | Modified | Untracked | Apparent purpose |
| --- | ---: | ---: | --- |
| Root documentation | 2 | 0 | Project direction and operating rules |
| Admin/API | 6 | 10 | Public snapshot projection, safe auth fallback, device audiences, grounded AI, regressions |
| Native mobile | 1 | 1 | Supplied 2026 Summit logo and Home integration |
| Public website | 41 | 78 | Summit/Awards presentation, historical profiles, schedule/live views, accessibility, metadata, security headers, images and tests |
| Project documentation | 2 | 13 | Handoff, ownership/context, design and verification evidence |
| Shared config/domain/fixtures | 9 | 1 | Reviewed attendance, stable person IDs, canonical program interpretation and tests |
| Scripts | 4 | 2 | Acceptance checks, bounded HTTP audit, read-only local-store preview |
| Archival handoff package | 0 | 12 | Frozen continuity package |

All changed/untracked files appear related to the intended project or its development tooling. This is a scope/provenance assessment, not proof of individual authorship or approval of every line. Existing owner-authorized changes must remain intact. No unrelated temporary payload was identified among the non-ignored untracked files.

## Commit Exclusions and Review Items

- `.env` is ignored private configuration. A pattern scan of commit-eligible text found no private-key blocks, GitHub/OpenAI/Supabase secret formats, AWS access-key IDs, or JWTs. This is a scoped scan, not an exhaustive security certification or a Git-history scan. No secret values were printed or added to documentation.
- Preserve ignored `work/`, especially `work/live-ops-store.json`, operational backups, and any submissions/device data. It is not safe to classify the entire directory as disposable scratch. The local store remains revision 9 with 26 sessions and 53 guests.
- Keep `.vercel/`, `.expo/`, native `.xcode.env.local`, `node_modules/`, `.pnpm-store/`, `.next/`, native `Pods/` and `build/`, `dist/`, `*.tsbuildinfo`, `test-results/`, `.DS_Store`, `tmp/`, output directories, and archive files out of ordinary source commits. These are already ignored; nothing was deleted or newly ignored.
- `apps/web/next-env.d.ts` is already tracked and has a generated change from `.next/types` to `.next/dev/types`. Preserve its exact bytes in a private recovery snapshot. Review this generated-only difference separately before a curated source commit; do not automatically stage build churn or discard the current file.
- The new icons, supplied logo PNGs, and `site-image-assets.json` are intentional runtime assets/metadata, not disposable build output. Their use and image inventory are exercised by existing tests.
- `CODEX_PROJECT_HANDOFF/` duplicates documentation intentionally. Preserve it as dated handoff evidence; current root/docs files supersede it. Whether to include that archive in a future source commit is a packaging decision, not a reason to delete it.

## Verification

Checks completed between **22:11 and 22:12 UTC** with **Node 24.19.0, pnpm 11.19.0, Next.js 16.3.3**, using the captured current source and installed dependencies. Private environment values were excluded; AI, push, and notification dispatch flags were disabled. The website API URL was a non-service loopback address. Provider tests use mocks. No deployment or real production workflow was invoked.

| Check | Result |
| --- | --- |
| `git diff --check` in original repository | PASS |
| `pnpm lint` | PASS across nine workspace packages; this command is TypeScript checking, not a separate ESLint/accessibility audit |
| `pnpm typecheck` | PASS across nine workspace packages |
| `pnpm test` | PASS: 649 tests across 73 test files; design-tokens has no tests and uses the existing pass-with-no-tests setting |
| `node --test scripts/audit-public-site-http.test.mjs` | PASS: 27 additional tests, not included by the root workspace test command |
| `pnpm --filter @not-alone/web build` | PASS with default Turbopack; 19 generated pages |
| `node scripts/start-admin-next.mjs build` | PASS with default Turbopack; 27 generated pages; same build entry point as the package script, without its HOME override |

Workspace counts: web 386, admin 155, domain 75, mobile 20, fixtures 5, API client 4, config 2, validation 2. No test, typecheck, or build failures were observed. Both fresh builds reported the expected absence of a build cache. No repairs or webpack fallback were needed.

This establishes local source health. It does not establish fresh browser/Simulator/physical-device acceptance, production credentials, deployed RLS/migrations, notification delivery, AI provider readiness, or App Store readiness. Operational acceptance scripts that can publish, seed, register devices, or modify cloud/local data were not run. No unnecessary repeat of the passing gates was performed after documentation-only edits.

## Current Local and Live Differences

Read-only public checks earlier in this same active task, around **22:02-22:03 UTC on September 17**, established:

- Public API: revision 9, 26 timed activities, 53 guest records, no degraded-adapter warning. Five incomplete activities remain represented in pending-program notes.
- Current local config/fixtures: 51 reviewed guests. Steven Cohen and Alexandra Cohen were removed from the local attendance allowlist by existing changes; the foundation credit remains. The recorded source-review claim is in `packages/config/src/confirmed-2026.ts`; Airtable was not re-queried for this baseline. No canonical cloud revision was published here.
- Local Awards presentation: approved 7:00 PM pre-show correction. Live Awards HTML and canonical API still show 7:30 PM. Both pending and Awards program content need coordinated, authorized reconciliation.
- The deployed API still includes editorial `roleSource` fields which the current local public projection removes. Local security/UI changes are therefore not fully reflected by observed deployed behavior; deployed commit IDs remain unverified.
- `notalonesummit.org` redirects to `https://www.inspiringchildren.org/summit`, with Squarespace markup, rather than the new Vercel site.
- The external Netlify RSVP form responds, has an optional phone field, and retains Yes / More information / No response wording. Storage, owner/team access, privacy, retention, and the proposed acceptance/waitlist semantics remain unverified.
- The live staff portal advertises administrator access for approved accounts; source confirms promotion of eligible profiles to ADMIN. Shared GitHub-token revocation remains unconfirmed.

Source also confirms that the attendee AI route already projects public data before both model and deterministic paths, and that local snapshot sync rejects `--apply`. Older notes describing those as unfinished or writable have been corrected or explicitly marked historical.

## Documentation Changes in This Task

Updated `README.md`, `docs/HANDOFF.md`, `docs/PROJECT_STATE.md`, `docs/DATA_AND_SERVICES.md`, `docs/KNOWN_ISSUES.md`, `docs/NEXT_TASKS.md`, `docs/PUBLIC_SNAPSHOT_SECURITY_2026-09-16.md`, and `docs/2026_ROS_IMPORT.md`; added this baseline. The archival handoff package was not altered. Original source/asset fingerprints and private-file checks must remain unchanged; only this explicit documentation list is allowed to differ from the initial inventory.

## Recommended Recovery Checkpoint

**PLANNED - no checkpoint commit, tag, bundle, or full private backup was created.** The temporary validation copy, hash manifest, and tracked-change patch are verification evidence, not a complete recovery backup.

1. First create a dated, access-restricted full filesystem snapshot/backup of the original repository, including `.git`, all modified and untracked files, ignored local operational data/backups, and private configuration. Store it outside the repository on encrypted storage. Verify integrity and a restore into a separate location. Coordinate the snapshot with any active local writers. Do not move or restore over the working repository.
2. Then create a local recovery branch and a reviewed checkpoint commit of intended source, assets, tests, and current documentation. Stage explicit reviewed paths, inspect the staged diff, and scan the staged content for secrets. Preserve the original index state and the generated-only difference in the private snapshot. A branch or tag pointing at the current HEAD alone cannot capture this dirty state.
3. Keep operational data and credentials in the private backup, outside Git. A Git bundle made after a checkpoint commit can provide a portable source/history backup, but it does not include ignored files or uncommitted state. Do not push the checkpoint automatically: connected Git/Vercel workflows may deploy it.

Do not use stash, reset, clean, seed, or public-snapshot replacement as the backup workflow. A source checkpoint is not a Supabase/RSVP/storage/device backup. Any separately requested service backup must preserve its target and be reviewed before access or export.

The next work remains the verified staging/security baseline and approved content reconciliation described in `NEXT_TASKS.md`. Wait for the owner's next instruction before feature work or checkpoint creation.
