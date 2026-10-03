# Awards website design and verification

## Latest producer separation

- The 2026 Awards talent-and-guests grid excludes the original approved producers,
  including executive producers. The five confirmed producers remain credited in
  their separate section below; no attendance records or 2025 credits were removed.
- The page now has 46 talent/guest cards (16 with photos), plus the five separate
  producer credits. The list announces: "The list is growing. More confirmed
  talent and guests will be announced."
- Regression tests cover separation, missing/generic producer metadata, preserved
  credits, confirmation gating and ordering. Lint, typecheck and all 164 tests pass.
- Browser inspection confirmed no producer duplicates in the guest grid and the
  production section below it. Desktop and 390px phone layouts had no horizontal
  overflow. This remains a local update, not a production deployment.

## Latest 2025-format alignment

- The 2026 Awards talent gallery now reuses the original 2025 portrait-grid CSS:
  square photographs, purple name panels, centered headings and the same spacing.
  The host uses the same portrait component, and current chair/producer sections
  inherit the original Awards styling rather than the separate 2026 refinement.
- Both years share the award-category markup. The 2026 expandable section remains
  explicitly labeled as historical 2025 categories, not confirmed 2026 awards.
- The 51-person confirmation gate and recognizable-name ordering are unchanged.
  No search controls, invented portraits, added people or new roles were introduced.
  The 2025 archive, existing hero and correct public Awards RSVP remain intact.
- Browser comparison at 1280x900 confirmed identical portrait size (280px square),
  four-column grid, 20px gaps, panel/name colors, heading and name typography, and
  section padding between the 2025 and 2026 talent sections. The expanded category
  grid also matched, including all 18 descriptions, padding and typography.
- Visually checked the gallery at 320x568, 390x844 and 768x1024. The narrow-phone
  producer section was checked too. No horizontal overflow or overflowing guest
  cards was observed. The dropdown opens and closes; the roster has no search.
- Repository lint, typecheck and all 163 tests passed, including 33 website tests.
  A regression test locks in shared host, portrait and category presentation.
- These changes are local only. No production deployment or native-device
  certification was performed for this website-formatting change.

## Latest owner-requested confirmation gate

September 16 recheck of the read-only Airtable interface:
https://airtable.com/app7BHptsc1bjc3DD/pagFmzDhXfNK53eWY

- The Confirmed Attendance group now has 54 rows: 51 named confirmations and
  three TBC placeholders. Steven Cohen and Alexandra Cohen are no longer in that
  group. This supersedes the earlier 53-person review below; no decline status is
  inferred. The Cohen Foundation sponsorship is unchanged.
- Current website people require both a reviewed Airtable confirmation and staff
  publication. Stale published records cannot bypass the reviewed allowlist.
- The latest owner instruction also requires attendance confirmation for current
  host, chair and producer cards. Historical credits alone no longer bypass this
  check. The complete 2025 archive is unaffected.
- The Awards gallery has no search controls. Familiar talent is ordered first;
  ordering cannot add people. Real portraits and a compact name list replace
  missing-photo tiles. Attendance is still not a performance/honoree claim.
- Bundled guest IDs remain stable after the two withdrawals. Live API records,
  deployed websites, and installed app builds are not changed by these local edits.
- Airtable remains read-only and manually reviewed, not an automatic live sync.
  Future confirmation changes require another review and release/publication.

## Earlier visual-pass record

Scope: owner-approved 2026 Awards presentation and the coordinated original-site
restoration. No native app, admin permissions, canonical event records, or Airtable
records were modified by this visual pass.

## Content boundaries

- Current dates, program and 53 confirmed guests come from the reviewed published
  2026 snapshot. Summit attendance does not imply an Awards performance or honor.
- Original chair and production credits remain the owner's approved exception.
- Missing portraits use initials, never generated or guessed photographs.
- Four current portraits were retrieved read-only from Airtable attachments.
- The hero uses the existing Wynn Las Vegas venue photograph. The video poster
  remains the explicitly labeled 2025 Awards image, avoiding a repeated hero shot.
  Source: https://www.youtube.com/watch?v=z2NdP-X7_Mc (official Not Alone Challenge).
  Image: https://i.ytimg.com/vi/z2NdP-X7_Mc/maxresdefault.jpg.
- The separate 2025 archive retains its source names, portraits and full copy.

## Verification

- Repository lint and typecheck passed.
- Repository tests: 153 passed, including 24 website tests.
- Website production build passed; all routes compiled.
- Browser layout matrix: 320x568, 375x667, 390x844, 430x932, 768x1024,
  1024x768, 1440x1000 and 1920x1080. No horizontal document overflow.
- Visual inspection of compact phone, standard phone, tablet and desktop layouts.
- Guest search, empty results, profile links and Awards-specific return navigation
  verified. The directory displayed 53 guests with no observed broken images.
- Highlights poster, Play, Close and external YouTube fallback verified.
- Hero-image follow-up: distinct hero/video regression test passed, with repository
  lint, typecheck and all 153 tests rerun successfully. Venue-image crops checked at
  1440x1000, 1280x720, 390x844 and 320x668 with no horizontal overflow.

## Limitations

The owner-requested 2025 producer restoration adds the six original credits and
portraits to the Awards archive, reusing the same source as the Summit archive.
Both archives now have a regression check for the exact roster, categories and
portraits. Repository lint, typecheck and all 154 tests passed after this change;
the restored section was visually checked on desktop and phone.

The in-app browser did not render the cross-origin YouTube embed contents.
Embedded playback is therefore not claimed as verified. The official watch page
played successfully; its always-visible link remains available, and the poster is
retained behind an empty iframe. This is browser-based website QA, not native iOS
or every physical device certification. Unconfirmed Awards roles remain pending.
