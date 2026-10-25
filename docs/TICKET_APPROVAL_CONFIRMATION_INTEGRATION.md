# Ticket approval and confirmation integration

Status: preview implementation based on Cherrial Odell's October 24 email. Her email referenced a technical contract and code package, but Gmail shows that neither attachment arrived. This document records the implemented boundary and the remaining connection values.

## Data separation

- Existing RSVP requests remain unchanged.
- `ticketOffer` records copy approved allocations from the approval system. Awards Show and Nevada Mental Health Day counts are separate.
- `ticketConfirmation` records hold the guest's response and complete attendee details. A response never edits the RSVP request or the offer.
- Both kinds use the existing primary `staff-portal` store and append-only `staff-portal-journal` backup.
- The full staff backup now includes both kinds; the portal also provides a confirmation CSV.

## Approval-system contract

`POST /api/staff/ticket-offers` accepts an offer from an authenticated staff session or a bearer token matching the server-only `TICKET_APPROVAL_SYNC_SECRET`.

Required values: `externalApprovalId`, `name`, `email`, `awardsTicketsOffered`, `communityDayTicketsOffered`, and `approvalUpdatedAt`. Contact and professional fields are retained when supplied. Reposting the same `externalApprovalId` updates the copied offer without creating another confirmation link.

`GET /api/staff/ticket-offers` returns copied offers and confirmations to an authenticated staff session or the same bearer token.

When a guest submits the private confirmation form, the staff portal is written first. If `TICKET_APPROVAL_API_URL` and `TICKET_APPROVAL_SYNC_SECRET` are configured, the response is then posted to that URL with `type: "ticket-confirmation"`, the external approval ID, and the response. Mirror failures remain visible in the portal and do not lose the response.

## Publishing restriction

Outbound confirmation email, text and ticket sending is not part of this implementation and remains disabled. A confirmation URL appears only inside the signed-in staff portal/API. No messages are sent automatically.

## Still needed from Cherrial's system

- The approval system's HTTPS callback URL.
- A shared sync secret installed directly in both hosting environments.
- The missing technical contract/package, if its field names or response rules differ from the contract above.
- Explicit approval before any outbound email, text or ticket-delivery feature is enabled.
