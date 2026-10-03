export type SignupStatus = "confirmed" | "waitlisted";
export type StoredSignup = { status: SignupStatus | "cancelled"; pending?: "join" | "leave" };
export type SignupState = { installId: string; name: string | null; items: Record<string, StoredSignup> };

export function emptySignupState(installId: string): SignupState {
  return { installId, name: null, items: {} };
}

/** Random per-install id (RFC 4122 v4 shape). Identifies this device's sign-ups; not a secret. */
export function createInstallId(random: () => number = Math.random): string {
  const hex = Array.from({ length: 32 }, () => Math.floor(random() * 16).toString(16));
  hex[12] = "4";
  hex[16] = (8 + Math.floor(random() * 4)).toString(16);
  const s = hex.join("");
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export function pendingOperations(state: SignupState) {
  return Object.entries(state.items)
    .filter(([, item]) => item.pending)
    .map(([scheduleItemId, item]) => ({ scheduleItemId, action: item.pending! }));
}

export function applySignupResponse(state: SignupState, scheduleItemId: string, status: string): SignupState {
  const items = { ...state.items };
  if (status === "confirmed" || status === "waitlisted") items[scheduleItemId] = { status };
  else delete items[scheduleItemId];
  return { ...state, items };
}
