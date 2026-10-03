import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { mobileApiBaseUrl } from "../lib/mobile-api";
import { applySignupResponse, createInstallId, emptySignupState, pendingOperations, type SignupState, type SignupStatus } from "../lib/signups";

// Experience sign-ups: the attendee's name and choices are kept on the device first, then sent
// to the staff API (POST /api/signups). Names are never shown publicly; staff see them in the portal.
const STORAGE_KEY = "not-alone.experience-signups.v1";

type SignupsContextValue = {
  ready: boolean;
  name: string | null;
  statusFor: (scheduleItemId: string) => SignupStatus | null;
  setName: (name: string) => void;
  join: (scheduleItemId: string) => void;
  leave: (scheduleItemId: string) => void;
};

const SignupsContext = createContext<SignupsContextValue | undefined>(undefined);

export function SignupsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SignupState | null>(null);
  const stateRef = useRef<SignupState | null>(null);
  const syncing = useRef(false);
  const syncAgain = useRef(false);

  const commit = useCallback((next: SignupState) => {
    stateRef.current = next;
    setState(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const sync = useCallback(async () => {
    const current = stateRef.current;
    if (!current?.name) return;
    if (syncing.current) { syncAgain.current = true; return; }
    syncing.current = true;
    syncAgain.current = false;
    try {
      for (const operation of pendingOperations(current)) {
        const response = await fetch(`${mobileApiBaseUrl}/api/signups`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ installId: current.installId, name: current.name, ...operation })
        });
        const result = await response.json().catch(() => ({})) as { ok?: boolean; signup?: { status?: string } };
        // Our API answered 404/422 (JSON ok:false): the item is no longer an open experience, so drop
        // it. Anything else (offline, not yet deployed, server error) keeps it queued for a retry.
        const rejected = result.ok === false && (response.status === 404 || response.status === 422);
        const accepted = response.ok ? result.signup?.status : rejected ? "cancelled" : undefined;
        if (!accepted) continue;
        commit(applySignupResponse(stateRef.current!, operation.scheduleItemId, accepted));
      }
      // Pick up staff changes such as a waitlist status.
      const lookup = await fetch(`${mobileApiBaseUrl}/api/signups?installId=${encodeURIComponent(current.installId)}`);
      if (lookup.ok) {
        const result = await lookup.json() as { signups?: Array<{ scheduleItemId: string; status: string }> };
        let next = stateRef.current!;
        for (const signup of result.signups ?? []) {
          if (next.items[signup.scheduleItemId]?.pending) continue;
          next = applySignupResponse(next, signup.scheduleItemId, signup.status);
        }
        commit(next);
      }
    } catch {
      // Offline or the API is unavailable: choices stay saved on the device and retry later.
    } finally {
      syncing.current = false;
    }
    // A sign-up tapped while this pass was running gets its own pass now.
    if (syncAgain.current) void sync();
  }, [commit]);

  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!mounted) return;
      let loaded: SignupState | null = null;
      try { loaded = raw ? JSON.parse(raw) as SignupState : null; } catch { loaded = null; }
      commit(loaded?.installId ? loaded : emptySignupState(createInstallId()));
      void sync();
    }).catch(() => { if (mounted) commit(emptySignupState(createInstallId())); });
    const subscription = AppState.addEventListener("change", status => { if (status === "active") void sync(); });
    return () => { mounted = false; subscription.remove(); };
  }, [commit, sync]);

  const value = useMemo<SignupsContextValue>(() => ({
    ready: Boolean(state),
    name: state?.name ?? null,
    statusFor: (id) => {
      const item = state?.items[id];
      if (!item || item.status === "cancelled") return null;
      return item.status;
    },
    setName: (name) => {
      if (!stateRef.current) return;
      commit({ ...stateRef.current, name: name.trim() });
      void sync();
    },
    join: (id) => {
      if (!stateRef.current) return;
      const existing = stateRef.current.items[id];
      commit({ ...stateRef.current, items: { ...stateRef.current.items, [id]: { status: existing?.status === "waitlisted" ? "waitlisted" : "confirmed", pending: "join" } } });
      void sync();
    },
    leave: (id) => {
      if (!stateRef.current) return;
      commit({ ...stateRef.current, items: { ...stateRef.current.items, [id]: { status: "cancelled", pending: "leave" } } });
      void sync();
    }
  }), [commit, state, sync]);

  return <SignupsContext.Provider value={value}>{children}</SignupsContext.Provider>;
}

export function useSignups() {
  const value = useContext(SignupsContext);
  if (!value) throw new Error("useSignups must be used inside SignupsProvider");
  return value;
}
