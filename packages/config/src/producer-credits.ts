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

// 2026 credits as set in the NAS web meeting (Sept 21, 2026): "Producers" is the top tier
// (Aphrah Brokaw, Ryan Wolfington, Jewel), then "Executive Producers" (Trevor Short, Trent Alenik).
// Co-producer and lower titles are pending Ryan Wolfington's written approval and are not shown.
// The 2025 archive keeps originalProducerCredits exactly as ICF published them.
export const producerCredits2026 = [
  { name: "Jewel", category: "Producers", role: "Producer" },
  { name: "Ryan Wolfington", category: "Producers", role: "Producer" },
  { name: "Aphrah Brokaw", category: "Producers", role: "Producer" },
  { name: "Trevor Short", category: "Executive Producers", role: "Executive Producer" },
  { name: "Trent Alenik", category: "Executive Producers", role: "Executive Producer" }
] as const;

export function producerCredit2026(name: string) {
  const normalized = name.trim().toLowerCase();
  return producerCredits2026.find(person => person.name.toLowerCase() === normalized || (person.name === "Jewel" && normalized === "jewel murray"));
}
