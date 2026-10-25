# Cherrial's Approval Portal Workflow

Status: **LIVE**

Branch: `codex/cheryl-operations`

Route: `https://notalonesummit.org/staff/cherrial-operations`

Production deploy: `6add7a02fc8f3a605c1c5466`

Rollback deploy: `6add75ed419d0326fb215642`

## Purpose

Cherrial's Approval Portal is a separate workspace inside the existing password-protected staff portal. It uses the same canonical `staff-portal` store and append-only `staff-portal-journal`; it does not create a second RSVP database or require the 15-minute spreadsheet sync to operate.

## Workflow

1. **Intake:** current RSVP, VIP, Uber VIP, partner, Closing Dinner, wellness, Summit workshop, Tennis & High Tea, and poker records are read from the existing portal store.
2. **Review:** staff can approve, reduce, place on hold, or decline Awards and Nevada Mental Health Day quantities independently. Other programs receive their own approve, hold, decline, and quantity decision.
3. **Confirmation queue:** an approved request remains on contact hold until staff explicitly marks it ready. This decides who should receive a private confirmation link.
4. **Guest response:** the existing private confirmation experience records accepted counts, attendee contact information, adult waivers, SMS choices, and pending waiver IDs without altering the approved allocation.
5. **Fulfillment:** Awards attendees with completed waivers become ready for real ticket delivery. Nevada Mental Health Day attendees resolve to the check-in list. Dinner, wellness, site visits, workshops, and poker resolve to reservation or check-in lists.

## Data safety

- Original submissions are never edited by an approval or confirmation.
- Ticket allocations stay in `ticketOffer`; guest responses stay in `ticketConfirmation`.
- Non-ticket program decisions stay in `programApproval`.
- Every write uses the existing journaled submission store and appears in the full authenticated JSON backup.
- Stable source keys make later updates replace the corresponding decision instead of creating a duplicate decision.
- Historical ticket offers without the new queue fields remain readable and default to contact hold.
- Test/excluded requests stay visible and marked but do not become attendance totals.

## Release boundary

Outbound email, text, and ticket sending remains disabled. “Ready to contact” is a reviewed queue, not a send action. Any outbound automation requires separate owner approval.

## Verification

- TypeScript check passed.
- Production build passed and includes `/staff/cherrial-operations` plus the backward-compatible `/staff/cheryl-operations` redirect and `/api/staff/program-approvals`.
- Focused workflow, ticket approval, and ticket confirmation tests passed.
- Browser-tested locally against a disposable copy of the October 24 production backup.
- Verified an Awards approval and queue transition, a Closing Dinner program approval, and unchanged source record counts.
- Authenticated production checks passed for the staff menu, Cherrial's Approval Portal, and the program-approvals API; unauthenticated API access remains blocked.
- The public live-site suite passed 33 checks with no failures or warnings after deployment.
- The full web suite was also run. It retains 50 documented baseline failures in unrelated schedule, RSVP-copy and public-site assertions; none involve Cherrial Operations, its APIs or the confirmation workflow.

