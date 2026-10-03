# Awards and Summit update - September 17, 2026

## Scope and release status

These are local code changes, not a new production deployment. Preview server:

- Awards 2026: http://localhost:3001/awards/2026
- Awards 2025: http://localhost:3001/awards/2025
- Summit 2026: http://localhost:3001/
- Summit 2025: http://localhost:3001/2025

No Airtable writes, collaborator imports, access grants, production content publication, push delivery, or App Store changes were performed for this update. Existing unrelated owner-authorized work was preserved.

## Implemented

- Correct Awards logo in the Awards header, using the owner's supplied logo ZIP. Summit uses its own supplied logo. The two tiny unnamed PNGs are not usable design references and were not substituted for actual brand artwork.
- Dark Awards header, page, profiles and footer; lighter Summit header and venue section.
- Awards navigation now uses one centered row: `2025 Awards`, `2026 Awards`, `Summit`, `Donate`, without an Archive suffix. The row replaces the separate year selector and top-right navigation/menu on Awards pages and profiles. Historical content remains year-separated; Summit's own navigation is unchanged.
- No full Summit schedule, map, app companion or generic Summit event-update block on Awards pages and profiles. The Summit link retains the existing year context. The Awards `Donate` tab links directly to `https://www.inspiringchildren.org/donate`, following the owner's updated destination. The hero's `RSVP for the Awards` button retains the existing RSVP website.
- Original photographic Awards hero with the RSVP button and text foundation credit, restored after the owner's visual review. The iHeartRadio YouTube link is now a compact red "Stream on iHeartRadio" button. Doors Open, Pre-Show and Awards Show use a compact time-first layout beneath the date, with gold times above smaller labels. The separate dark schedule strip and visible "Pacific Time" caption are removed. Time conversion still uses the published event timezone. Red Carpet remains omitted from this promotional summary at the owner's request; its canonical published record and other schedule surfaces are unchanged. Removed pending access/end-time boilerplate from promotional copy without inventing missing end times.
- Loni Love presented as 2026 host under the owner's explicit instruction, using the currently confirmed/published profile. Her host role is scoped to Awards, not inferred from attendance or assigned to unrelated sessions.
- Cherrial Odell included alongside Steve Wozniak and Jewel in both current Co-Chairs sections under the owner's explicit confirmation. Uses her existing ICF portrait and "Inspiring Children Alumna" credit without adding attendance, speaking or production records.
- Venue wording: Encore Theater at Wynn Las Vegas, subject to a subsequently published venue change.
- Doors 6:30 PM and pre-show 7:00 PM in the Awards promotional preview. See the publication boundary below.
- Removed the full Summit's additional-activities date block from the Awards area. The subsequent host-section refinement also removes the redundant "More details coming soon" line.
- Awards archive portrait links now open local historical profiles and return to Awards rather than sending the user to ICF. The 2025 producer credits and original captured people/roles/category descriptions remain.
- Added all 11 award entries named in the official 2025 Shore Fire announcement. The 18 original category descriptions remain separately, rather than being falsely presented as 18 verified winners.
- Summit's current guest grid excludes people already shown in its approved chair/production sections; those people remain visible in their respective sections. Separate year choices lead to 2026 and historical 2025 participants.
- Replaced the current Summit venue photo with an existing Wynn image rendered at its full 4:3 composition.
- Thursday start-only schedule entries now use the same time-group/card presentation as other days. Unknown end times and other uncertainties are retained; no complete session or live status was invented.
- Added the supplied white Summit logo to the native app Home source. This is a branding change, not a replacement of the native app with a website.

## Sources and factual limits

- Original 2025 Summit and Awards source capture: `apps/web/lib/original-sites.json` and original local imagery. Sources: https://www.inspiringchildren.org/summit and https://www.inspiringchildren.org/awards
- 2025 winners: https://shorefire.com/releases/entry/jewel-inspiring-children-foundation-celebrate-mental-health-innovators-with-inaugural-not-alone-awardsin-las-vegas
- Official foundation spelling: **Steven & Alexandra Cohen Foundation**, https://www.steveandalex.org/
- Official theater name: https://www.wynnlasvegas.com/meetings/premium-venues/clubs-and-theater
- iHeartRadio channel: https://www.youtube.com/iheartradio . This is a channel destination, not a verified direct 2026 broadcast URL. It is not labeled as a currently live stream.
- 2026 host and timing correction: explicit owner instructions in this task. General 2026 guest eligibility still follows reviewed Airtable confirmation and published visibility. Summit attendance alone does not establish an Awards appearance, performance, honor or production role.
- Existing verified recap is the **2025 Awards** video. It was not relabeled as a 2026 or Summit recap.

## Initial opening-area screenshot refinement (superseded)

- Scoped to the Awards year selector and 2026 hero. Existing venue photography, RSVP destination and below-hero content are retained.
- The date and four evening times now appear together above the calls to action, with an explicit timezone. The hero reuses the reconciled approved program and the public show record; it does not establish a separate schedule or publish content.
- Replaced the plain YouTube text link with a logo-led iHeartRadio action. The destination remains the official channel, not a verified event-specific live stream.
- Enlarged the foundation credit using the existing local `cohen-foundation.webp` artwork.
- New iHeartRadio asset: `apps/web/public/images/iheartradio-primary.png`, the official primary color-on-black artwork from https://brand.iheart.com/logo . Source: https://images.squarespace-cdn.com/content/v1/54becebee4b05d09416fe7e4/1739919939987-199G9SWAPQA5WWE8ORC3/iHR_primary_Color-black.png . Original pixels are retained; the local image inventory records measured dimensions and bytes.
- These remain local presentation changes. No production, operational-store, RSVP or user-submitted data is changed.

### Screenshot refinement verification

- Web suite: 394 tests passed, including eight new hero/year-navigation cases. Web TypeScript check passed without incremental writes.
- Web production build passed with default Turbopack in an isolated source/dependency copy; the existing preview server and its build directory were not replaced.
- Browser inspection at 320, 390, 768 and 1440 pixels: no horizontal overflow, hero text overflow, overlapping actions or missing hero images. The 2025 and 2026 links navigate correctly and identify the active year. No browser console errors were observed.
- Comparison against the recovery manifest found only the five intended edited files and two additions (hero tests and the iHeartRadio image). The eight preserved local operational/recovery files remain byte-identical.
- Prior full-workspace evidence below is retained as historical verification, not a claim that the entire workspace suite was rerun for this visual refinement.

## Host-section screenshot refinement

- Replaced the lower two-column "The Evening" section with a centered "Your 2026 Host" feature. Removed its duplicate venue, date, timetable, RSVP button and "More details coming soon" line. The date, venue, times and single primary RSVP remain in the opening area; see the current inline timing refinement below.
- Loni Love now has a larger square portrait, charcoal nameplate, gold accent, the owner-supplied "Comedian & TV Host" description and a link to her current Awards profile. The reference is the owner's old-site screenshot, adapted to the current dark Awards presentation.
- The host feature still depends on a confirmed, published current profile and an enabled directory; it is hidden for withdrawal, unavailable data or show cancellation. Published headshots still take precedence. No changes to 2025 archival presentation.
- Moved the existing `awards-program` anchor to the hero so header "RSVP & Details" navigation still reaches the schedule and RSVP. The new host section uses `awards-host`.
- Verification: all 403 web tests passed, including nine new host-feature cases; TypeScript passed without incremental writes; the default Turbopack production build passed in the isolated build copy. `git diff --check` passed.
- Browser checks at 320, 390, 768 and 1440 pixels confirmed centered portraits, loaded imagery, no horizontal overflow, no host-text overflow and no overlap with adjacent sections. The host profile link and responsive-menu "RSVP & Details" link work; the latter closes the menu and reaches the hero. No browser console errors were observed.
- Local presentation changes only: no production deployment, publication, RSVP submission, operational-store changes or user-data changes. Existing unrelated work remains intact.

## Opening rollback and schedule band (previous iteration)

- Following the owner's 9:36 PM screenshot review, restored the original hero composition, plain date styling, text YouTube link and text foundation credit. Removed the oversized iHeartRadio and foundation artwork panels from this presentation. Their asset files are preserved, not deleted.
- This iteration placed the approved times once in a compact dark band directly below the photograph: three columns on desktop and two on narrower screens, with an explicit timezone. Red Carpet was removed from this strip at the owner's request. The subsequent inline timing refinement replaces the band; no repeated venue/date, additional RSVP, or restored "The Evening" block remains.
- Loni Love's centered host markup and all host CSS rules were compared against the pre-change files and are byte-identical. The plain `2025`, `2026` year choices and working `awards-program` hero anchor are retained.
- The schedule still uses the same reconciled published data and cancellation/withdrawal safeguards. This is a presentation change, not a second schedule or a production publication.
- Verification: 404 web tests, TypeScript without incremental writes, an isolated default Turbopack production build and `git diff --check` passed. Desktop/mobile layout checks cover 320, 390, 768 and 1440 pixels; no horizontal overflow, text overflow or overlapping hero actions/credit was found.
- No production deployment, external form submission, operational-store change or user-data change.

## Stream action and year-tab refinement

- Made the iHeartRadio action a compact red, play-icon button matching the 48px RSVP height. It retains the official YouTube channel URL and announces the new-tab behavior; no verified event-specific stream URL or "live now" claim was added.
- Centered the `2025` and `2026` choices on both Awards pages using symmetric padding. Summit navigation is unchanged.
- All other page source outside the action block and icon import was compared against the pre-change copy and is unchanged. CSS changes are limited to the stream button and Awards year-tab alignment; the schedule, host, foundation credit and hero composition remain intact.
- Verification: 404 web tests, TypeScript without incremental writes, isolated default Turbopack production build and `git diff --check` passed. Browser checks at 320, 390 and 1440 pixels found centered tabs, no horizontal/text overflow and no overlapping buttons or foundation credit. The year links preserve their correct active state.
- Local presentation only; no production or user-data changes.

## Time-first refinement (current)

- Removed the separate schedule band so the photograph leads directly into the introduction. Following another owner review, the three remaining entries now use compact columns beneath the date, with the time above its smaller label and no enclosing panel or divider. Semantic label/value reading order is preserved.
- Removed the visible "Pacific Time" caption at the owner's request. The time values, event-timezone conversion and publication/cancellation safeguards are unchanged. Red Carpet stays omitted only from this Awards promotional presentation.
- Loni's markup plus host, streaming-button and year-tab styles were compared against the pre-change copy and remain unchanged. The foundation text and destinations are retained.
- Verification: 404 web tests, TypeScript without incremental writes, isolated default Turbopack production build and `git diff --check` passed. Browser checks at 320, 390, 768 and 1440 pixels found no horizontal or hero-text overflow, no overlapping actions/credit and a loaded venue image. The timing summary remains inside the hero, immediately after the date and before the actions.
- Local presentation only. No production deployment, canonical schedule update, operational-store write or user-data change.

## Centered Awards navigation refinement

- Consolidated the Awards header links and year selector into one centered, always-visible row in the former year-selector position: `2025 Awards`, `2026 Awards`, `Summit`, `RSVP`. Removed the separate top-right Awards links and hamburger; the existing brand mark remains above the row.
- Applied the same row to current and historical Awards profiles. The corresponding year is visually highlighted; only an actual Awards landing page is announced as the current page. Summit retains its own menu, responsive dismissal behavior and archive context.
- RSVP retains the existing `/awards/2026#awards-program` destination. The external form remains behind the current hero's registration action and its cancellation safeguards. No historical registration was reopened or external form submitted.
- The approved hero, timing summary, stream button, foundation credit and host markup are unchanged. The page stylesheet is byte-identical to the pre-navigation copy; page-component changes are confined to removing duplicate Awards navigation and leaving the local year selector Summit-only.
- Verification: 407 web tests passed, TypeScript passed without incremental writes, an isolated default Turbopack production build passed, and `git diff --check` passed. Browser checks at 320, 390, 768 and 1440 pixels confirmed one centered four-link row, no text/horizontal overflow and no Awards hamburger. Checked both year destinations, RSVP's current-event anchor, the current host profile and the transition through Summit's mobile menu. No browser console errors observed.
- Local UI changes only. No deployment, production publication, operational-store writes or user-data changes.

## Donate navigation label (previous destination)

- Replaced only the Awards navigation's `RSVP` tab with `Donate`, pointing directly to the existing `https://not-alone-awards-rsvp-2026.netlify.app/` destination as requested by the owner. Reuses the same configured URL as the main Awards RSVP action; no external application, form or payment flow was modified.
- Preserved the other navigation destinations, approved hero, schedule and host. Slightly tightened the mobile link spacing to accommodate the longer label without wrapping the centered row.
- Verification: 407 web tests, TypeScript without incremental writes and an isolated default Turbopack production build passed. Browser checks at 320 and 1440 pixels confirmed the exact external href, centered single-row layout, no horizontal/text overflow and no console errors. No external form was submitted, live data changed or production deployment performed.

## Donate destination correction (current)

- Updated the Awards navigation's `Donate` link to the owner-supplied `https://www.inspiringchildren.org/donate` URL on both years and Awards profiles. The existing RSVP action still points to the separate RSVP website.

## Cherrial Odell co-chair confirmation

- **IMPLEMENTED:** One explicit owner-approved co-chair list feeds both 2026 Awards and Summit leadership. Cherrial already appears in the original 2025 Summit co-chair source; the archive and its profiles remain unchanged. No other co-chair display exists in mobile or admin, so no additional surfaces, records or role categories were invented.
- The current credit reuses the existing portrait `/original-2025/249d15f3447ac6ac1059.png` and original "Inspiring Children Alumna" copy. No new biography, affiliation, headshot or personal data was fetched or fabricated.
- The editorial approval is not added to the confirmed attendee allowlist, directory, canonical snapshot or producer list. Existing reviewed/publication filtering for other people is unchanged. Disabled, empty or unavailable directories remain hidden; an explicitly unpublished matching current record suppresses the new credit. Future revocation of the editorial approval should also remove it from the owner-approved list.
- Verification: 419 web tests passed, including 12 new cross-page co-chair cases; TypeScript without incremental writes, an isolated default Turbopack production build and `git diff --check` passed. Awards and Summit browser checks at 320 and 1440 pixels confirmed the correct three names/portraits, loaded assets and no horizontal/text overflow or console errors.
- No deployment, production publication, guest import, operational-store change or user-data write.

## Follow-Up Status

1. **Cherrial Odell: IMPLEMENTED locally.** The owner's full-name and co-chair confirmation resolves the earlier "Cheryl" placeholder. See the implementation and verification above.
2. **RSVP application:** The existing destination is https://not-alone-awards-rsvp-2026.netlify.app/ . Its source is not in this repository. Read-only inspection found phone currently optional, with response choices "Yes, I plan to attend", "I would like more information", and "No, I am unable to attend". No form was submitted or data collected during testing. Requiring phone and changing workflow statuses need access to that application's source/settings and confirmation of exact status semantics. Attendee responses and staff-assigned waitlist/acceptance status should not be silently conflated.
3. **RSVP team access/outreach:** Storage, team permissions, lawyers/doctors outreach tracking and the reported count of about eight real external contacts were not verified. No new team access was granted. Do not report these as complete.
4. **Direct 2026 broadcast link:** Replace the channel link only when the official event-specific stream URL is supplied or verified.
5. **Design coordination:** No contact with Ysa/Isa and no collaborator integration occurred. An owner-approved design reference can be reviewed without restoring collaborator permissions or importing external code.
6. **Shared schedule publication:** The current cloud publication still contains the older 7:30 PM pre-show note. The Awards preview applies the owner's narrowly scoped 7:00 PM promotional correction to that legacy note on November 2 only. A later published complete pre-show session, cancellation or changed show date takes precedence. This is not a cloud/mobile schedule update. Correct and publish the canonical pending program and Awards content together through the staff publishing workflow before coordinated launch, then remove the obsolete legacy correction when appropriate. No production publication was performed in this task.
7. **Native runtime check:** The supplied logo is wired into the mobile Home source and passes automated checks. The currently installed Simulator build was an older bundled build; the new logo was not visually verified in a rebuilt native app. Do not call the mobile branding release-ready on this evidence alone.
8. **Deployment:** Local preview is available, but the new design/content has not been deployed publicly in this task.

## Verification evidence

### Awards-only roster curation (September 17 follow-up)

- The current Awards page follows the public site's five guest categories: Founders (8), Musicians (4), Entertainers & Athletes (6), Experts (6), and Business Leaders & Philanthropists (3). The preserved `original-sites.json` provides the 2025 groupings; the live public Awards page now carries 2026 dates.
- There are 35 unique people: 27 categorized guests, three co-chairs, one host and four production credits. Editorial precedence is Co-Chairs, Host, Executive Producers, Producers, then the five guest categories in the order above. Jewel appears only as a co-chair. This is presentation precedence, not a claim about professional seniority.
- Awards-only curation does not change the canonical 51 locally reviewed guests, submissions, attendance records or Summit directory. Cherrial Odell remains an independently approved co-chair, not an imported attendance record.
- Seventeen reviewed guests are held out of this Awards presentation because a matching public Awards category was not established: Nick Dana, Sarah Steil, Morgan Marler, Sanem (Sam) Alkan, Michael Townsend, Leah Smith, Margaret Hines, Jessica Edwards, Kase Murray, Jan Thwaites, Sally Dewhurst, Sophie Novak, Clark Cummings, Paige Neuenschwander, Isabella Wolfington, Cathy Olson and Jeff Levin. This is not a claim that these people have no relevant qualifications; additional verified editorial information can resolve these omissions.
- Anthony Ramos, Alana Springsteen, Caroline Jones, Lexi Hensler, Brandon Saho and Caroline Silby have verified public category fits and short biographies but no portrait in the preserved 2025 sources. They are names-only entries, with no invented headshots. Available source photographs are reused, including shared couple/sibling photographs; individual crops have not been guessed.
- Every included person, including leadership and production credits, links to a biography. Nonempty published biographies win; otherwise short original factual summaries of public ICF or professional sources are supplied locally in `awards-people.ts`. Source links accompany fallback biographies. These are paraphrases, not verbatim republications or invented achievements. Awards-context profiles have distinct canonical URLs; Summit profiles remain unchanged.
- Current scoped verification: 424 web tests, isolated production build and its TypeScript check passed. Browser verification found 35 unique listings, the expected category counts, loaded guest portraits and no horizontal/text overflow at 390 and 1440 pixels. Ellie Kanner and Cherrial Odell biography navigation was checked directly.
- No deployment, production publication, operational-store update or user-data mutation occurred.

The following verification is historical evidence from the earlier baseline, not a fresh full-workspace run for this roster change.

- Full workspace `pnpm test`: 649 tests passed (web 386, admin 155, domain 75, mobile 20, config 2, validation 2, API client 4, fixtures 5).
- Full workspace `pnpm lint` and `pnpm typecheck`: passed.
- Web production `next build --webpack`: passed.
- Browser checks: Awards and Summit at widths 320, 390, 768 and 1440 pixels; no horizontal overflow found. Loaded-image checks found no broken images in the inspected views.
- Browser interactions: Awards mobile menu/Escape, current host profile and Awards back link, 2025 winners anchor, Thursday schedule cards, year controls, and distinct Awards/Summit headers checked.
- Historical content tests verify source names/roles, six producer credits, original category descriptions and the added 11 official winner entries.
- This is scoped verification, not a guarantee of perfection, every browser/device, RSVP delivery, mobile release behavior or a final production acceptance test.
