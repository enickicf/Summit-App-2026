# Ticket approval and confirmation integration

Status: live on `notalonesummit.org` and `notaloneawards.org` in production deploy `6add7248fc5edf2e215afa69`. The October 24 upgrade adds a protected ticket-approval workbench directly to the existing staff portal, so staff can operate the complete core workflow without depending on Cherrial's undeployed local draft. Cherrial's 6:12 PM package was reviewed and its personal-waiver, separate text-consent, and no-send requirements were incorporated. The external approval-system mirror remains optional until an HTTPS callback URL and shared secret exist.

## Data separation

- Existing RSVP requests remain unchanged.
- `ticketOffer` records copy approved allocations from the approval system. Awards Show and Nevada Mental Health Day counts are separate.
- `ticketConfirmation` records hold the guest's response, complete attendee details, personal waivers, separate ticket-logistics/event text consent records, and pending-waiver IDs. A response never edits the RSVP request or the offer.
- Both kinds use the existing primary `staff-portal` store and append-only `staff-portal-journal` backup.
- The full staff backup now includes both kinds; the portal also provides a confirmation CSV.

## Direct staff workflow

- Full staff users open `/staff/ticket-approvals` from the staff portal.
- Each real invitation party appears once. A newer Awards-only request cannot erase an earlier Nevada Mental Health Day request, and vice versa.
- Staff may approve, reduce or decline the two event allocations independently. A saved approval creates one stable private confirmation URL; updating the allocation does not create a new URL.
- The guest can accept fewer tickets, cancel either event, correct every attendee's name/email/phone, and save attendance while other adults' personal waivers remain pending.
- One adult at a time identifies themself, accepts the existing production liability/media terms, signs personally, and may separately opt into ticket-logistics texts and event/future-ICF texts. Unchecked choices do not create or revoke consent.
- Staff can see accepted counts and the number of pending personal waivers. Nothing in this flow issues tickets.

## Approval-system contract

`POST /api/staff/ticket-offers` accepts an offer from an authenticated staff session or a bearer token matching the server-only `TICKET_APPROVAL_SYNC_SECRET`.

Required values: `externalApprovalId`, `name`, `email`, `decision`, `awardsTicketsOffered`, `communityDayTicketsOffered`, and `approvalUpdatedAt`. Contact, professional and attendee-roster fields are retained when supplied. Reposting the same `externalApprovalId` updates the copied offer without creating another confirmation link.

`GET /api/staff/ticket-offers` returns copied offers and confirmations to an authenticated staff session or the same bearer token.

When a guest submits the private confirmation form, the staff portal is written first. If `TICKET_APPROVAL_API_URL` and `TICKET_APPROVAL_SYNC_SECRET` are configured, the response is then posted to that URL with `type: "ticket-confirmation"`, the external approval ID, and the response. Mirror failures remain visible in the portal and do not lose the response.

## Publishing restriction

Outbound confirmation email, text and ticket sending is not part of this implementation and remains disabled. A confirmation URL appears only inside the signed-in staff portal/API. No messages are sent automatically.

## Optional external bridge

- The approval system's HTTPS callback URL.
- A shared sync secret installed directly in both hosting environments.
- Explicit approval before any outbound email, text or ticket-delivery feature is enabled.
