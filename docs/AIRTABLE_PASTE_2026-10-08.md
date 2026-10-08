# Airtable paste sheet, October 8, 2026 (Ryan Wolfington's website edits)

Airtable base `app7BHptsc1bjc3DD` (Main NA Summit 2026), Simplified Talent grid. Claude does not write to Airtable:
the website already shows these decisions through owner overrides in code; this sheet lets the team make Airtable
match so the next Airtable read carries them on its own. Paste the values exactly as written.

## Ryan Wolfington -> Title

Replace the Title cell (today: `President, Jewel Inc. | Founder, Inspiring Children Foundation | Co Founder, Not Alone Challenge`) with:

```
Founder, Inspiring Children Foundation and Not Alone
```

Ryan: "Take off 'co-founder' for Not Alone... I would put 'Founder, Inspiring Children Foundation and Not Alone'."
Until Airtable is updated the website applies this title itself (`apps/web/lib/title-overrides-2026.ts`).

Ryan also asked to be taken off the producer credits ("you can just take me off... I didn't even want to be on that").
He stays a Founder everywhere. In Airtable, remove `Executive Producer` from his Website Grouping (keep `Founder` and
`Philanthropist`). The website hides him from the credits regardless (`apps/web/lib/producer-credits-2026.ts`).

## Raquelle Stevens -> Website Grouping

Today: `X - attendee`. Ryan: "she should be up with these speakers" and "put Raquelle Stevens as a producer... that's
fine, as well as a speaker". Set Website Grouping to:

```
Producer
F - talent
```

(`Producer` is the chip the base uses for the Producers credit; `F - talent` is the listing tier that puts her in the
2026 Lineup as a speaker. Use whichever tier the team prefers, A-F; any tier lists her.) Her Title cell reads
`Author/ Producer`; the team may want `Author / Producer` (a space before the slash). Until Airtable is updated the
website lists her in the Summit 2026 Lineup and in the Producers credit itself.

## Jessica Edwards -> Website Grouping

Today: `X - attendee`. Ryan: "Put Jessica Edwards up with the other speakers." Set Website Grouping to a listing tier,
for example:

```
F - talent
```

Her Title (`CDO, NAMI`), bio and headshot are already filled. Until Airtable is updated the website lists her in the
Summit 2026 Lineup itself.

## Cherrial Odell -> Bio

Ryan: "Cherrial's bio is not in there." Please open her record (Website Grouping `Associate Producer`, `Co-Chair`,
`F - talent`) and confirm the Bio cell is filled. The Oct 3 read recorded a full bio for her ("Cherrial Odell has risen
above extreme childhood trauma..."), and the website shows it on her profile and lineup card; if the cell is empty
now, paste that text back or a newer one. If there are two Cherrial rows, keep the bio on the one with the headshot.

## Headshots to check: King Trot, Ben Maxwell, Mario Martinez

Ryan wants King Trot in the talent lineup, Ben Maxwell on the Awards Show too, and mentioned Mario Martinez. All three
need a photo on the site to be listed (the completeness gate: title, photo, bio).

- The Oct 3 Airtable read recorded a Headshot attachment for each of them, and the website has a card photo for each
  (`/2026-headshots/portraits/king-trot-c.jpg`, `ben-maxwell-c.jpg`, `mario-martinez-c.jpg`). If Ryan is looking at
  records without a photo, please check the attachment is still on the record and upload a sharp, straight-on headshot
  (at least 900 px on the short side) if the one on file is weak or missing.
- King Trot: `F - talent`, title and bio filled. Listed in both lineups as soon as the photo is on file.
- Ben Maxwell: `D - talent`, title and bio filled. Listed in both lineups as soon as the photo is on file; the website
  keeps him on the Awards page whatever his tier chip says (Ryan, Oct 8).
- Mario Martinez: `X - attendee` (Attendees section only). To list him with the talent, give him a tier chip (A-F).

## Aloe Blacc

Ryan: "We gotta take Aloe Blacc out." His record is still `Pending`; leave it that way (or set it to Declined). The
website no longer makes an exception for him. If he confirms later, set the status to `Confirmed Attendance`, add a
Website Grouping tier, title, bio and headshot, and he returns on the next read.

## Everyone

Ryan: the team emails all talent to confirm their bios and photos. For every person listed on the site, please check
that the Title, Bio and Headshot cells are filled and current; a missing piece keeps the card off the site.
