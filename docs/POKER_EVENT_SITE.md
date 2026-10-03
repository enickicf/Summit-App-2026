# All In For Mental Health — standalone charity poker site

**Built and deployed September 28, 2026. LIVE at https://all-in-for-mental-health.netlify.app**
(its own Netlify site `all-in-for-mental-health`, id `f6dd63e6-208b-4b63-89e2-297674b6ca98`, in the
owner's account). Source and full instructions: `work/poker-site-2026-09-28/`.

## Owner direction

The owner asked for a landing page and a form to promote the charity poker tournament that runs the
night before the Summit, then, the same day: **"do not connect it to the summit website these requests
should be completely separate."**

So the event lives as **its own website**, on its own Netlify site, with its own storage and its own
password. It is not a route on `apps/web` and it does not appear in the Summit menu or sitemap. The one
deliberate exception, asked for by the owner later the same day, is that each accepted request is
**mirrored** into the shared staff portal so the team sees poker sign-ups beside (but apart from) the
Awards and Community Day lists — see "The seat requests and the staff portal" below. Storage, form,
password and CSV stay this site's own, and a test still fails if any other Summit, Awards or RSVP host
appears in one of its files.

An earlier version of this work did add `/poker` to `apps/web` and a poker section to the staff portal;
**that was fully reverted** the same day. `apps/web` is back to its previous state (the suites that were
touched — staff portal, site metadata, image inventory, submissions — pass, and `tsc` is clean).

## The site

Owner direction, same day: a real multi-page website like the Summit's, still completely separate, with
a custom logo and the seat form as its RSVP link. A charity-poker event page the owner sent was used
only to understand **what such a site does** (event details, tournament and ticket information, a
registration route, the benefiting organisation, venue) — none of its details, features or look were
copied. A voice note the following round set the current shape:

- **A photograph instead of the flat green.** The hero runs a real Wynn Las Vegas interior under a dark
  scrim (Wikimedia Commons, photo by Andrew Milligan sumo, CC BY 2.0, credited in the footer as the
  licence requires). No free-licensed photograph of the Encore Poker Room itself exists, so the owner may
  want to supply an official Wynn image; the file swap is one line in `build.py`.
- **The Summit's hero grammar**, on this site's own footing: copy held to the left over the scrim, the
  mark above it, "Presented by / Wynn Resorts Foundation" in the Summit's credit treatment, the date and
  venue on one line ("Sunday, November 1, 2026 | Encore Poker Room, Wynn Las Vegas"), and two
  square-cornered buttons — **RSVP** and **How the night works**.
- **The menu** is the Summit's: white bar, links centred, and the foundation's blue Donate pill on the
  right. The "Reserve your seat" button is gone from the menu; RSVP is a menu item.
- **Said once.** The repeated "the night" block and the closing "Ready to take a seat?" were removed from
  the home page; the evening, the room, the buy-in and the prize live in one facts strip, and the
  rebuys/add-on sit under the buy-in figure the way the owner liked.
- **The Cause** page leans on the foundation's own site: its mission statement, its "we lift up
  underprivileged youth" line, its published reach (millions online, 2,500 in person, 150 in the
  leadership programme, 95% scholarships), its six programme names, and the Summit's own published
  mission — set as a gradient pull-quote, a stat row and a brand-blend panel rather than a grid of cards.

| Page | Purpose |
| --- | --- |
| `index.html` | Hero, the four facts, and why we're playing |
| `tournament.html` | Buy-in and grand prize side by side, the run of the evening, three ways to take part |
| `cause.html` | The foundation's mission, reach and programmes; the Summit's mission |
| `venue.html` | Encore Poker Room at Wynn Las Vegas, with ICF's own photograph of the towers |
| `rsvp.html` | The form — every RSVP on the site leads here |
| `seats.html` | The event team's private list (password, unlisted, not indexed) |

Every page carries the same header and footer; a test fails if one drifts. The pages are plain static
HTML, with `build.py` in the folder to regenerate them from one shared template.

## Owner edits, September 28 (second pass)

- The **schedule moved into the hero**: doors 6:00 PM and cards in the air 7:00 PM now sit with the
  presenter, the date and the venue, above the fold. The "$500 buy-in" summary line came off the hero;
  the money facts stay in the strip under the photograph.
- **One hero button, RSVP.** "How the night works" is gone.
- **The Tournament page is deleted** — the home page carries what it costs and what you win. Its
  "nothing is paid on this website" promise moved to sit under the buy-in.
- **The Cause** page ends by pointing at the foundation: "For more information about the foundation and
  its programs, visit inspiringchildren.org." The Summit-convening section was removed.
- **Venue** no longer promises directions later (we already know where it is); it names the room,
  the address, the evening and how to find it.
- **The menu** is Home / The Cause / Venue / RSVP / **Summit** (an external link to
  notalonesummit.org), with Donate on the right. That link is the only tie to the Summit — the site
  still has its own storage, password, functions and everything else, and a test enforces exactly that.
- **The Cause page was tidied** (owner: "could be a lot more neat"): it now leads with the owner's own
  line — "Every seat directly supports a young person's mental health." — and reads top to bottom in one
  column: the mission quote, the foundation's logo as its attribution, the 25-years paragraph, the four
  published numbers, the six programs as a quiet two-column list, and the link out to
  inspiringchildren.org. The lopsided two-column mission block, the EIN-heavy opening paragraph and the
  half-empty closing slab are gone; the page is a third shorter. The same line leads the home page's
  "Why we're playing" section.
- **The palette now matches Inspiring Children and the Not Alone Summit**: white, near-black, ICF blue
  (#4a5faa), light blue (#8fb1e0), pale blue (#d0d4ea) and the Not Alone gradient for accents. The felt
  green is gone; the poker identity comes from the photography and the mark.

**Still open:** no freely-licensed photograph of the Encore Poker Room exists. Wynn's own press room has
one ("Wynn Poker Room — Main Room", credit Barbara Kraft), but it is editorial-use press material, so it
was not taken. The owner should request the official image from Wynn Resorts — the site is partnered
with their foundation — and it is a one-file swap in `assets/`.

## The Cause page, from the foundation's own deck

Owner (Sept 28): use the ICF Simple Deck as the source. Read from
`~/Downloads/ICF Simple Deck 8.07.25_compressed.pdf` (22 pages, extracted with PDFKit — no poppler on
this machine). What was taken, and from where:

- **The mission as the foundation states it** (p2), replacing the shorter website tagline.
- **The best-in-class outcomes** (p8) with the deck's own labels and its own footnote: 100% entered
  with depression, 50% suicide attempts or self-harm, 97% full remission, 100% earned college
  scholarships, 58% Tier 1 schools. Drawn as bars, as the deck draws them, with the two arrival figures
  held back in grey so the outcomes carry the colour. "100% Tears of Joy" was left off.
- **Dr Blaise Aguirre's line** (p10), with his credit.
- **The program catalogue in the foundation's own names** (p5), replacing the earlier hand-written list.
- **The published figures** (p15): $52M in scholarships, 1.7M online, 2,500 in person, 22 cities, and
  "100% of donations go directly to programs" — quoted as the foundation's claim about donations, not
  restated as a claim about the buy-in.

Nothing was paraphrased into a stronger claim than the deck makes.

## The seat requests and the staff portal

Owner (Sept 28): the form must be completely separate from the other events' RSVP forms, but the team
must see the poker sign-ups in the same portal, apart from Community Day and the Awards show.

- **Separate collection.** The form, the site and the `poker-seats` blob store belong to this event
  alone. No other event's RSVP form reaches them, and a test enforces that.
- **One portal.** After storing a request, the site's function mirrors it to
  `https://notalonesummit.org/api/poker` (apps/web). It appears at notalonesummit.org/staff in its own
  **"All In poker seat requests"** section, with its own "Poker seats requested" tile and its own CSV
  (`/api/staff/export?kind=poker`) — never inside the Awards ticket requests or Community Day.
- **The mirror never costs a guest their seat.** It is best effort with a 6-second timeout; if the
  portal is slow or down the request is still stored here and the guest still sees the confirmation.
  This site's own store is the record of truth.
- Verified end to end locally: a table sponsor submitted on the poker site arrived in the portal's
  poker section with the right seat count, and appeared in neither the Awards nor the Community Day
  section. The test row was removed from the local development store afterwards.

## The pages as deployed

Home · The Cause · **Sponsorship** · Venue · RSVP · Concert (the one outward link, to
notaloneawards.org/awards/2026 — the owner asked for that label and nothing else shared), plus the
unlisted `/seats` for the team. The Sponsorship page carries all five levels from the owner's matrix —
Title $100,000 (45 reserved seats / 25 Awards tickets), Presenting $50,000 (36/20), Premier $25,000
(27/15), Champion $10,000 (18/10) and Table **$4,500** (9/5) — as cards that deep-link into the form
with the level already chosen (`rsvp.html?interest=table&level=<name>`), Title leading across the full
width. On the form, "Sponsor a table" reveals a second, required dropdown of the same levels with their
amounts; a sponsor is flagged as a table sponsor in the portal with their level and pledged amount.
"Send me more information" was dropped from the form on the owner's instruction, though the value is
still accepted so a cached page cannot start failing and older rows keep their label. Experience reads
Casual / Regular / Professional.

## Where the room is

The invitation names only "Encore Poker Room" and "at Wynn Las Vegas". The site places it **on the
Encore casino floor**: the owner's direction on September 28, 2026 ("re-write the info to have it in
the encore"), confirmed by Wynn's own page — "Both cash and tournament play is held in the poker room
located at the Encore" (wynnlasvegas.com/casino/poker; PokerNews dates the move to 2016). Nothing
further is known, so the site claims no tower, entrance or parking; a test guards both sides of that
line. Settled jointly with the other session working in this folder.

## The logo

The event has its own mark, built in the grammar of the Not Alone Summit logo (heavy lowercase wordmark,
gradient heart in place of a counter, second line in the same gradient): **"all ın"** with the heart as
the dot of the "i" — the foundation's heart doubling as the heart card suit — over **"for mental health"**
in the Not Alone gradient. It is drawn live in HTML and inline SVG on the site, and shipped as
`assets/all-in-logo-black.png`, `all-in-logo-white.png` and a 1200×630 `share-card.png` for email, decks
and print. Type is Poppins, self-hosted.

## The event

From the foundation's own invitation (Constant Contact, "INVITATION: Wynn Charity Poker Event"):
presented by the Wynn Resorts Foundation, benefiting ICF's youth mental health and wellness programs;
Sunday, November 1, 2026; Encore Poker Room at Wynn Las Vegas; registration & cocktails 6:00 PM,
tournament 7:00 PM; $500 buy-in, $200 rebuys, $100 add-on; grand prize a $10,400 WPT World Championship
seat or $10,000 cash. The invitation names no dress code, capacity, payout table or proceeds claim, so
the page states none of those.

Note: the Airtable run of show already carries a "Poker Night" row for 2026-11-01, 19:00, Encore Poker
Room, which is the same event on the Summit's own schedule. That row is untouched.

## How the requests are stored

One Netlify Blobs store, `poker-seats`, on the poker site itself. A guest's request is one JSON blob.
The event team reads them at `/seats` on that site with a shared password (`POKER_PORTAL_PASSWORD`,
set only in that site's environment; set by the owner on September 28) and can download a CSV. Seats are
counted once per email, so a retried submit never double counts. A submission is a request, not a seat,
and no payment is taken.

**The mirror runs only in production.** `mirrorToPortal` returns immediately unless the function is
really executing on Netlify (`NETLIFY === "true"` or a Blobs context). It is gated because on
September 28 the unit tests called `handleSeatRequest` without passing a mirror, the default live one
ran, and about 30 "Ray Lewis" fixture rows landed in the owner's production portal looking like real
guests. They were removed and then permanently deleted. A test now stubs `globalThis.fetch`, runs the
suite's submissions with `NETLIFY` unset, and fails if a single outbound request is made.

## What is published

`netlify.toml` publishes **`public/`**, not the folder root. Before the first deploy it published `"."`,
which would have served the gitignored `.env` (it holds the staff password) along with `build.py` and
the tests. Everything a browser may see now lives in `public/`; verified against the live site that
`/.env`, `/build.py`, `/test.mjs` and `/package.json` all return 404.

## Verified locally (September 28, 2026)

 `npm test`: 15 tests pass. In a real browser against a local run of the
site and both functions: all five public pages show no horizontal overflow at 1280 or 390 px and no
console or network errors, the menu walks correctly with the right link marked current on each page,
Poppins loads from the site's own files, the header "Reserve your seat" lands on the form, the two-field
sign-up and the expanded "sponsor a table" path both returned `{"ok":true}` and showed the confirmation,
the requests appeared on `/seats` after signing in with the right seat totals, and the CSV downloaded
with every field. Nothing was deployed and no production data exists
yet (the local run used an in-memory store).

## Still open — needs the owner

1. **A domain**, if the site should not stay on `all-in-for-mental-health.netlify.app` (a `poker.`
   subdomain, say).
2. **The invitation already sent** points at a Microsoft Form; those responses stay there and this site
   cannot read them. Later emails should link to the new site, and someone should export the Microsoft
   Form's rows so both lists sit together.
3. **No automatic email** goes to a guest after a request: no sending service exists for the foundation.
4. **The sponsorship matrix graphic** the owner sent disagrees with the live site twice: it prices the
   Table level at $5,000 (the owner corrected it by hand to **$4,500**, which is what the site and the
   portal use) and it gives the contact address as `director@inspiringchidlren.org`, which is misspelled.
   Confirm the right address before that graphic goes out again.
5. **Trent Alenik's direct email and phone** appear on that matrix but are not published on the
   sponsorship page. The owner decides whether they should be.
6. **A photograph of the actual Encore poker room.** The page uses a licensed Wynn interior; Wynn's press
   room has a real one but it is editorial-use only, so the foundation should request the official image
   (a one-file swap).
