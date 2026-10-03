# Website Image Performance - September 16, 2026

## Scope and Measurement Limits

This report consolidates previously recorded localhost HTTP asset measurements,
the measured local image inventory, source inspection, and completed tests. No
HTTP requests or browser automation were repeated for this documentation pass.
The original event content and pending hero-asset selection were not changed.

The transfer numbers below are **HTTP response-body bytes from the local Next
development server**, compared with source-file bytes. They are not production
or real-user network measurements, initial-page transfer totals, LCP, CLS,
Lighthouse scores, or proof of a page-load-time improvement. HTTP header and
transport overhead are excluded. The four selected images are a sample, not an
exhaustive page/network waterfall.

## Observed HTTP Transfers

Measured at **2026-09-16 22:43:29 America/New_York**
(`2026-09-17T02:43:29.523Z`). Requests used origin
`http://127.0.0.1:3001`, header `Accept: image/webp`, and `q=75`.
The parent had identified optimized sources in its 390px browser inspection;
this worker measured the requested URLs directly, without driving a browser.

| Asset | Source dimensions | Requested width | HTTP status | Content-Type | Source bytes | Response bytes | Bytes saved | Reduction |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| Wynn hero | 1500 x 1125 | 640 | 200 | image/webp | 560,524 | 74,642 | 485,882 | 86.68% |
| Original archive portrait | 718 x 718 | 256 | 200 | image/webp | 731,322 | 5,534 | 725,788 | 99.24% |
| Reviewed Steve Wozniak headshot | 2560 x 1707 | 256 | 200 | image/webp | 329,940 | 2,944 | 326,996 | 99.11% |
| Footer ICF logo | 1500 x 1136 | 256 | 200 | image/webp | 452,270 | 7,746 | 444,524 | 98.29% |
| **Selected-image total** | | | | | **2,074,056** | **90,866** | **1,983,190** | **95.62%** |

Exact observed request paths, in the same order:

```text
/_next/image?url=%2Fimages%2Fwynn-las-vegas.webp&w=640&q=75
/_next/image?url=%2Foriginal-2025%2F1fa744536fa297cd811c.png&w=256&q=75
/_next/image?url=%2F2026-headshots%2Fsteve-wozniak.jpg&w=256&q=75
/_next/image?url=%2Fimages%2Ficf-logo.webp&w=256&q=75
```

All four responses reported `X-Nextjs-Cache: HIT`. The downloaded body length
matched `Content-Length` in every case; `Content-Encoding` was absent. Source
comparisons used the corresponding files under `apps/web/public`, not estimates.
Reduction is `(source bytes - response bytes) / source bytes`.

### Footer Loading Decision

A separate, earlier localhost HTTP measurement at
`2026-09-17T02:33:10Z` used the same Accept header and quality:

| Footer request width | HTTP status | Content-Type | Response bytes | Optimizer cache |
| ---: | ---: | --- | ---: | --- |
| 128 | 200 | image/webp | 3,448 | HIT |
| 256 | 200 | image/webp | 7,746 | HIT |
| 384 | 200 | image/webp | 13,126 | MISS |

The footer's CSS slot is 100px wide. These are useful 1x/2x/3x candidates from
Next's configured width set; this is not a claim that every browser chooses the
same candidate. Its 384px response is below the new **16 KiB** regression budget.

The parent reported that the footer logo can appear above the fold on short,
support, and loading pages and trigger Next's lazy-image LCP warning. The footer
was changed to `loading="eager"`, without an explicit preload or high fetch
priority; no other loading policy changed for this warning. The shared helper
remains lazy by default. The installed Next warning
checks for `loading === "lazy"`; this source check is not an LCP measurement.

### Earlier In-Memory Encoding Evidence

Using the installed Next optimizer locally, with 256px WebP at quality 75, the
header logo encoded from 196,741 to 16,858 bytes. Combined with the footer's
7,746 bytes, the two shell images encoded from 649,011 to 24,604 bytes, a 96.21%
reduction. The header result was an in-memory encoding, **not a recorded HTTP
transfer**. No derivative image files were written by this worker.

## Inventory and Icons

`apps/web/components/site-image-assets.json` currently records **171 images**,
**73,997,894 source bytes**, their orientation-aware dimensions, and byte lengths.
This is repository inventory size, not bytes downloaded by a page.

| Public directory | Image count | Source bytes |
| --- | ---: | ---: |
| `original-2025` | 109 | 51,656,383 |
| `people` | 31 | 13,687,831 |
| `images` | 14 | 4,232,088 |
| `2026-headshots` | 4 | 1,282,126 |
| `icons` | 6 | 155,627 |
| Public root | 7 | 2,983,839 |
| **Total** | **171** | **73,997,894** |

- All **109 unique original-2025 mappings** were checked against disk: no missing
  paths and no dimension/byte mismatches. Wynn and the 1280 x 720 highlights
  poster are also covered; the poster's source size is 240,922 bytes.
- The initial inventory was 165 files / 73,842,267 bytes. The six new icons account
  for the entire 155,627-byte increase. This worker registered their measured
  metadata and did not create or alter the icons.
- There are 19 files over 1,000,000 bytes and 89 non-square images. Preserve
  intrinsic aspect ratios rather than assigning a nominal square to every file.
- All 165 initial asset SHA-256 hashes were unchanged at this worker's earlier
  preservation check. Later inventory tests also validate dimensions and byte
  lengths. No source image was rewritten or deleted by this worker.
- The current inventory JSON is 14,289 bytes on disk, or 13,603 bytes minified /
  3,860 bytes gzipped. This is an isolated data-size measurement, not a measured
  client bundle size; it excludes Next Image and other JavaScript.

| New icon path under `public` | Dimensions | Bytes |
| --- | --- | ---: |
| `/icons/awards-48.png` | 48 x 48 | 3,775 |
| `/icons/awards-180.png` | 180 x 180 | 23,269 |
| `/icons/challenge-48.png` | 48 x 48 | 4,022 |
| `/icons/challenge-180.png` | 180 x 180 | 23,053 |
| `/icons/challenge-192.png` | 192 x 192 | 24,654 |
| `/icons/challenge-512.png` | 512 x 512 | 76,854 |

The root metadata references the challenge 48px/180px icons; Awards metadata uses
the corresponding Awards icons. The web manifest references challenge 192px/512px
icons. Those references are source-inspected, not additional HTTP measurements.

## Adoption and Fallback Status

The helper is `apps/web/components/site-image.tsx`. It uses the built-in
`next/image` optimizer and measured metadata, requires explicit `alt` and `sizes`,
and rejects unknown/remote sources and custom source/loader overrides. It does
not infer factual image descriptions or grant any event role. CSS controls the
rendered slot; intrinsic width/height preserve the source aspect ratio. Deliberate
`fill` use requires a positioned, sized parent. No new service or optimizer
configuration was introduced.

| Surface | Source-inspected status | Fallback / qualification |
| --- | --- | --- |
| Header and footer | Both use `SiteImage`; header slot is 82px/100px and footer is 100px. Both are eager. Footer now preserves its 1500:1136 ratio. | Alternative text and logo identities are retained. |
| Original event pages | All 11 former raw-image call sites use `SiteImage` with explicit `sizes`, including archive portraits, leadership, logos, and heroes. | Original paths and archived facts remain distinct from reviewed 2026 content. |
| Awards guest gallery | Known inventory paths use `SiteImage`. | Unknown URLs, including remote URLs, retain raw lazy/async `<img>` rendering rather than entering the local-only optimizer. Failed portraits use initials. Guests without photos remain name-only; no fabricated portraits. |
| Awards highlights | Local poster uses `SiteImage`. | The former duplicate original-image CSS background is removed. Video loading/playback state and the external YouTube fallback remain separate from image optimization. |
| Current Summit directory | Known local assets use `SiteImage` with default lazy loading and `sizes="(max-width: 600px) 66px, 76px"`. | Unknown/remote sources retain raw lazy/async `<img>`. Missing or failed images select initials; decorative image semantics and adjacent names are preserved. |
| Individual profiles | Known local assets use `SiteImage` with eager loading and `sizes="(max-width: 380px) 90vw, (max-width: 700px) 300px, 340px"`. | Unknown/remote sources retain raw `<img>`. Missing or failed images select initials. Decorative semantics remain intact; no unrelated archived portrait is substituted. |

The completed directory and profile adoptions were verified by source inspection
in `apps/web/components/directory.tsx` and
`apps/web/app/directory/[slug]/portrait.tsx`. Both use
`getSiteImageMetadata(src)` to select the optimized branch and retain error
handlers in both optimized and raw-image branches. The helper supplies measured
intrinsic dimensions; neither adoption expands its local-only allowlist. This
documentation update made no additional HTTP measurements or app changes.

Profile SSR tests verify the missing-image initials (`MT`), `aria-hidden` wrapper,
decorative `alt=""`, and raw-URL rendering. They also exercise archive/current
separation, disabled/unavailable directory states, and missing profiles. Awards
SSR tests verify name-only output when portraits are absent. The failed-load
state handlers were source-inspected here; this worker did **not** induce real
browser image failures, so browser fallback behavior is not claimed as newly
verified by this report.

## Verification Record

The latest completed runs recorded by this worker, reused without rerunning for
this documentation-only pass:

| Check | Recorded result |
| --- | --- |
| `pnpm --filter @not-alone/web test` | **31 files, 313 tests passed**, September 16 at 22:49 America/New_York. |
| `pnpm --filter @not-alone/web lint` | Passed. |
| `pnpm --filter @not-alone/web typecheck` | Passed. |
| `git diff --check` | Passed on the preceding implementation pass; checked again for this document. |

After the directory and profile adoptions, the parent reported **33 focused tests
passed**. That result is parent-reported, not a new test run by this worker or a
replacement for the earlier full-suite result above.

Relevant coverage includes full inventory dimensions/byte lengths, local-only
source restrictions, responsive optimizer URLs, intrinsic dimensions, decorative
alt text, loading/preload/fill behavior, forwarded error handlers, shell loading
choices, the footer 16 KiB encoding budget, source-copy preservation, and archive
profile header-year regression tests. Existing SSR source-image assertions were
adapted to optimized URL encoding; optimization was not disabled to satisfy tests.

The parent separately reported 66 route/viewport browser checks passing and
observed optimized sources at 390px. These are parent-reported functional checks,
not browser automation performed by this worker and not a complete performance
waterfall or a substitute for production measurement.

## Remaining Limits

- Recheck image cropping, responsive candidate selection, and load-error fallback
  behavior in the parent's browser workflow following the directory and profile
  adoptions.
- Measure a production build and a representative real/throttled network before
  making user-perceived performance, LCP, or Lighthouse claims. Local cache hits
  do not establish cold-production performance.
- The selected 95.62% payload reduction is not a whole-site or whole-page saving.
  Archive originals remain intentionally available; raw fallback URLs can still
  transfer their full source bytes.
- This document makes no release-ready claim. No deployment, production write,
  paid operation, new service, or further app change was performed for this pass.
