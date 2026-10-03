# Summit Refresh

Status: IMPLEMENTED locally, with PARTIAL partner content. No deployment.

## Scope

- Latest owner-requested cleanliness pass applies the Awards site's restrained hierarchy to Summit: aligned section spacing, smaller category headings, consistent portrait nameplates, a compact film callout and removal of inherited empty directory spacing. The Partners header's decorative ring was removed. Summit colors, content, guest data and routes remain Summit-specific; Awards markup and styles were not changed. Browser checks at 1440px and 390px found no horizontal overflow and retained all 26 guest cards. All 421 web tests passed.

- Summit now has one centered navigation: 2025 Summit, 2026 Summit, Schedule, Partners, Venue, Donate. The old Summit header, hamburger, challenge banner, duplicate year navigation and secondary section dashboard are no longer rendered. Auxiliary routes remain available through their existing contextual links. Donate uses the official ICF donation page.
- Summit-specific CSS provides deep plum, lavender, pearl and mint surfaces, revised spacing and typography, a video-led hero, dedicated Partners and Venue destinations, and a matching footer. Partners and Venue no longer interrupt the Summit home-page narrative. The Awards pages retain their approved layout; only the explicitly requested public display roster changes are included.
- Historical Summit content and credits remain historical. The new presentation applies to both Summit years, but 2025 sponsors are never silently promoted to 2026 partners.
- Current Summit guest presentation reuses the already reviewed local public category curation: 26 guest cards including the separately known Awards host, three co-chairs and four production credits. Sean & Ana Wolfington and Melinda & Noah Springer each share one card, photograph and public profile in both current website contexts. Canonical people and operational records remain separate and unchanged. Guests occur in one category; co-chairs take precedence over production. Public guest categories are Founders, Musicians, Entertainers & Athletes, Experts, and Business Leaders & Philanthropists. The home-page guest gallery has no duplicate participant tabs, category controls, search box or counter.
- Current Summit profiles retain published roles/categories and nonempty published biographies; short sourced public summaries fill empty biographies for the curated guests. No new speaking, performance or Summit-host assignment was inferred from attendance. The current Summit host remains unassigned; Jason Kennedy's historical Summit-host role is not promoted to a current appointment.

## Media Provenance

The original public Summit page, inspected read-only September 17-18, provides the hosted film:

`https://static1.squarespace.com/static/628691b65c3a24383d0eac0a/t/6903b537a55efd60f08cd4b5/1761850692502/THE+GRAND+FINALE+2.mp4`

The endpoint returned HTTP 200 and video/mp4. It is streamed remotely, not downloaded into this repository. The hero silently plays a short 9-18 second visual clip, includes a pause/play control and respects reduced-motion preferences. A separate, direct link opens the complete public 2025 film; it does not send visitors to the original Summit site. The separate Jewel photograph and full native-controls player were removed from the home page. The source's exact editorial characterization as a post-event highlight reel is UNKNOWN; it was published as Summit background media in 2025. No separate verified post-event Summit reel or caption track was available.

## Portrait Refinements

- Caroline Silby's official full-length photograph is framed around her face and shoulders in cards and public profiles.
- Lexi Hensler's public 2019 Kids' Choice Awards portrait replaces the generated Linktree preview graphic; her profile shows the full image in a portrait frame. Source: https://celebmafia.com/wp-content/uploads/2019/03/lexi-hensler-kids-choice-awards-2019-4.jpg
- Bob and Mike Bryan use distinct public individual photographs, framed as headshots. Sources: https://commons.wikimedia.org/wiki/File:Bryan_B._RG15_(1)_(19120636110).jpg and https://commons.wikimedia.org/wiki/File:Bryan_M._RG19_(12)_(48199368111).jpg
- 421 web tests and the TypeScript check passed following these refinements. Browser checks confirmed Caroline's face crop, Lexi's full portrait and the combined founder profiles.

## Partner Access

- Airtable search verified `Main NA Summit 2026`, base `app7BHptsc1bjc3DD`. The connected account has interface-only permissions. Table discovery was refused and interface discovery returned no accessible interfaces/pages. No Airtable write, permission change or credential work occurred.
- Therefore additional confirmed partner names, tiers and logo attachments could not be inspected. This part of the owner's request remains PARTIAL, not complete.
- The section renders only published snapshot sponsors, deduplicated by name and grouped by their actual tier. Missing current logos are text-only, except the already verified Cohen Foundation credit which reuses its preserved ICF asset. The current published roster contains that foundation only.
- Historical sponsors use preserved 2025 source credits: Powered by Cohen Foundation, Presented by Villa Bibbiani, Sponsored by Wynn Resorts. A missing historical Villa Bibbiani logo is not invented.
- Next step: provide read access to the relevant Airtable partner interface/table or a non-secret approved partner export with names, confirmed status, tier, official logo and website. Do not publish draft sponsors or assume every attachment is an approved logo.

## Verification

- 421 web tests passed after replacing obsolete hamburger/disclosure expectations with the requested six-link navigation behavior. New tests cover the clipped video markup, public partner visibility/deduplication, dedicated nav routes, historical/current separation, the one-card Wolfington display and supplied Awards portraits. Awards category, profile, host, stream, schedule and navigation regression tests remain passing.
- Isolated production build and its TypeScript check passed with external API directed to a closed loopback endpoint and AI/notification flags disabled. Builds did not replace the running original development server's output or load private environment files.
- Browser checks: Summit video loaded (readyState 4, nonzero source dimensions) and played; hero pause control paused it; native highlights controls started playback. No horizontal overflow or oversized heading/navigation text found at inspected 390 and 1440 pixel viewports. Shared navigation links, partner tier, directory and production sections were inspected.
- Known remaining limits: additional Airtable partner logos, a distinct post-event Summit reel if desired, captions/transcript and full browser/device acceptance. No production deployment or release-readiness claim.
- Production systems, submissions, local operational store, native app and staff app were not changed.
