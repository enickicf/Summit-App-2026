"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupStatusControl({ signupId, status }: { signupId: string; status: "confirmed" | "waitlisted" }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const nextStatus = status === "waitlisted" ? "confirmed" : "waitlisted";

  async function update() {
    if (working) return;
    setWorking(true);
    setError(undefined);
    try {
      const response = await fetch("/api/staff/signups", {
        method: "PATCH",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, status: nextStatus })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? `Update returned ${response.status}.`);
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <span className="signupControl">
      <button className="secondaryButton" disabled={working} onClick={update} type="button">
        {working ? "Saving..." : nextStatus === "waitlisted" ? "Move to waitlist" : "Confirm"}
      </button>
      {error ? <span className="signupMeta" role="alert">{error}</span> : null}
    </span>
  );
}
