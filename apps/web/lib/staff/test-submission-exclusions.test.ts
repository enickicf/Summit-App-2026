import { describe, expect, it } from "vitest";
import { closingDinnerTotals, excludedFromPortalTotals, pokerTotals, rsvpTotals, withRsvpForm, type ClosingDinnerSubmission, type PokerSubmission, type RsvpSubmission } from "./store";

const identities = [
  ["Seth Test", "sethwintertongolf@gmail.com"],
  ["Ambassador Test", "ambassador@inspiringchildren.org"],
  ["Charlie the Unicorn", "charlie@example.com"],
  ["Cherrial Odell", "cherrial@example.com"]
] as const;

const base = (name: string, email: string, index: number) => ({ id: `00000000-0000-4000-8000-00000000000${index}`, submittedAt: `2026-10-24T20:0${index}:00.000Z`, source: "form" as const, name, email });

describe("test submissions stay stored but never change portal totals", () => {
  it("recognizes both test emails and both test names without case sensitivity", () => {
    for (const [name, email] of identities) expect(excludedFromPortalTotals({ name: name.toUpperCase(), email: email.toUpperCase() })).toBe(true);
    expect(excludedFromPortalTotals({ name: "Real Guest", email: "guest@example.com" })).toBe(false);
  });

  it("excludes them from every RSVP event and form total while retaining export rows", () => {
    const rows = [
      ...identities.map(([name, email], index) => ({ ...base(name, email, index), guestCount: 2, attendanceStatus: "attending", attending: "both", communityDay: true } as unknown as RsvpSubmission)),
      { ...base("Real Guest", "guest@example.com", 8), guestCount: 1, attendanceStatus: "attending", attending: "both", communityDay: true } as unknown as RsvpSubmission
    ];
    expect(rsvpTotals(rows)).toMatchObject({ formsSubmitted: 1, uniqueGuests: 1, ticketsRequested: 1, communityDayGuests: 1, communityDayTickets: 1 });
    expect(withRsvpForm(rows).filter(row => row.excludedFromTotals === "yes")).toHaveLength(4);
  });

  it("applies the same rule to closing dinner and poker totals", () => {
    const dinner = [...identities.map(([name, email], index) => ({ ...base(name, email, index), bringingGuest: true } as unknown as ClosingDinnerSubmission)), { ...base("Real Guest", "guest@example.com", 8), bringingGuest: false } as unknown as ClosingDinnerSubmission];
    expect(closingDinnerTotals(dinner)).toEqual({ formsSubmitted: 1, requests: 1, seatsRequested: 1, withGuest: 0 });
    const poker = [...identities.map(([name, email], index) => ({ ...base(name, email, index), interest: "player", seats: 4 } as unknown as PokerSubmission)), { ...base("Real Guest", "guest@example.com", 8), interest: "player", seats: 1 } as unknown as PokerSubmission];
    expect(pokerTotals(poker)).toMatchObject({ formsSubmitted: 1, uniqueGuests: 1, seatsRequested: 1, players: 1 });
  });
});
