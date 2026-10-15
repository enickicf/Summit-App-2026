# Invitation website routing — October 15, 2026

IMPLEMENTED and LIVE. Owner requested website-only text invitations, with a separate general VIP website for Uber VIP recipients. Normal VIP and general Awards invitations use the regular event websites. No RSVP form or submission store was created or changed.

## Live entry points

| Audience | Website | Ticket/RSVP destination |
| --- | --- | --- |
| Uber VIP | https://notaloneawards.org/vip | https://notaloneawards.org/rsvp/vip-fls0u8ccn2vs |
| Uber VIP, Nevada Mental Health Day | https://notaloneawards.org/vip/community-day | Same combined VIP form |
| Normal VIP or general Awards | https://notaloneawards.org/awards/2026 | https://notaloneawards.org/rsvp |
| Normal VIP, Nevada Mental Health Day | https://notaloneawards.org/community-day | https://notaloneawards.org/rsvp/nevada-mental-health-day |

Uber VIP navigation keeps Awards and Day links within `/vip`. Both menus also expose Closing dinner, pointing to the existing live information/request page at `/rsvp/closing-dinner-yiqy7fw0j3`. The new closing-dinner design remains a separate localhost preview and was not deployed. `/vip` and `/vip/community-day` are unlisted/noindex, matching the existing partner website pattern; they are not password-protected.

The invitation wording specifies normal VIP allotments of up to two Day tickets and up to ten Awards tickets per the owner's copy. Those are invitation instructions, not newly implemented form limits. Existing form configuration is unchanged.

## Release and checks

Production baseline: deploy `6ad15496868ee524d64c4698` from the existing headshot-upgrade working tree, whose existing application modifications all preceded that deploy. The baseline's existing uncommitted changes were preserved. Scoped additions: two routes, one partner registry entry, optional dinner menu links, navigation tests.

New deploy: `6ad163ed8badb56a9decec47`, built as a draft using production context, then promoted after browser review. Published at 2026-10-15 16:39:50 America/Los_Angeles. Existing production ID was checked immediately before promotion to prevent overwriting a concurrent release.

VERIFIED: web typecheck; 711 web tests in 97 files; Next production build; live browser links on all four entry points; VIP navigation and all event CTA destinations; noindex metadata; phone menu with no page overflow. No form submissions were created. Screenshots in ignored `outputs/vip-invitation-20261015/`.
