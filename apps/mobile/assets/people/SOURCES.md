# App headshot sources

Every portrait is bundled so the app works offline. Portraits for people featured on the website are
downloaded from the website's own approved image (see `imageSource` in lib/summit-content.generated.json).
Headshots added for the app on Sept 19, 2026 (official/public pages, identity checked):

| Person | Source |
| --- | --- |
| Jessica Edwards | NAMI leadership page, https://www.nami.org/who-we-are/meet-our-leadership/jessica-edwards/ |
| Rahil Briggs | ZERO TO THREE team page, https://www.zerotothree.org/team/rahil-d-briggs/ |
| Leah Smith, Michael Townsend | Cropped from Tape Art's "Leah and Michael" photo, https://www.tapeart.com/who-we-are |
| Margaret Hines | Suicide Prevention Resource Center profile headshot; identity matched to CrisisTalk's captioned photo "Margaret Hines and Kevin Hines" |
| Ray Lewis | Wikimedia Commons "Ray Lewis 2015 (cropped)" (Wikipedia lead image); identity per Airtable note "his nonprofit is called Ray of Hope" (Ray of Hope Foundation) |
| Sanem (Sam) Alkan | Sobrato staff page, https://www.sobrato.com/people/sam-alkan/ (Airtable: Resonance Philanthropies / Sheri Sobrato) |
| Jeff Levin | Adweek "Gen Z Talent Manager Jeff Levin" portrait (Airtable occupation: Talent Manager) |
| Sarah Steil | Artist press photo from NashvilleVoyager interview "Meet Sarah Steil" (Airtable occupation: Musician) |

Still needed from the event team: Miriam Isa (several public people share the name; none confirmed as the Summit guest). Drop a square JPEG named after the person (e.g. `miriam-isa.jpg`) here and rerun
`python3 scripts/bundle-headshots.py`. Image rights for event use should be confirmed before release.
