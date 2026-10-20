// User-approved source for producer credit eligibility, not attendance confirmation.
export const producerCreditSource = "https://www.inspiringchildren.org/summit";
export const originalProducerCredits = [
  { name: "Jewel", category: "Executive Producers", role: "Executive Producer" },
  { name: "Ryan Wolfington", category: "Executive Producers", role: "Executive Producer" },
  { name: "Trevor Short", category: "Executive Producers", role: "Executive Producer" },
  { name: "Dr. George Rapier III", category: "Executive Producers", role: "Executive Producer" },
  { name: "Trent Alenik", category: "Producers", role: "Producer" },
  { name: "Aphrah Brokaw", category: "Producers", role: "Producer" }
] as const;

export function originalProducerCredit(name: string) {
  const normalized = name.trim().toLowerCase();
  return originalProducerCredits.find(person => person.name.toLowerCase() === normalized || (person.name === "Jewel" && normalized === "jewel murray"));
}

// Owner (Oct 15, 2026): Ryan Wolfington, Aphrah Brokaw and Jewel alone are 2026 Executive
// Producers; Trevor Short and Trent Alenik are Producers. The 2025 archive above is historical.
export const producerCredits2026 = [
  { name: "Jewel", category: "Executive Producers", role: "Executive Producer" },
  { name: "Ryan Wolfington", category: "Executive Producers", role: "Executive Producer" },
  { name: "Aphrah Brokaw", category: "Executive Producers", role: "Executive Producer" },
  { name: "Trevor Short", category: "Producers", role: "Producer" },
  { name: "Trent Alenik", category: "Producers", role: "Producer" }
] as const;

export function producerCredit2026(name: string) {
  const normalized = name.trim().toLowerCase();
  return producerCredits2026.find(person => person.name.toLowerCase() === normalized || (person.name === "Jewel" && normalized === "jewel murray"));
}
