import { getActiveOperationalNotices, getEventPhase, getNowAndUpcoming, groupPublishedProgramByDay } from "@not-alone/domain";
import type { EventSnapshot } from "@not-alone/validation";
import { eventDateKey } from "../../schedule/schedule-presentation";

export function liveEventState(snapshot: EventSnapshot, nowUtc: string) {
  const timeline = getNowAndUpcoming({ snapshot, nowUtc, audienceGroups: ["public"] });
  const notices = getActiveOperationalNotices(snapshot, nowUtc, ["public"]);
  const today = eventDateKey(nowUtc, snapshot.event.timeZone);
  const pendingDays = groupPublishedProgramByDay(snapshot).filter(day => day.notes.length > 0);
  const remainingPendingDays = pendingDays.filter(day => day.date >= today);
  let phase = getEventPhase(snapshot, nowUtc, ["public"]);

  // The shared phase helper returns empty without timed sessions. Pending dates
  // still describe a program, but must never be converted into invented times.
  if (phase === "empty" && pendingDays.length > 0) {
    phase = today < pendingDays[0]!.date ? "before" : today > pendingDays.at(-1)!.date ? "after" : "live";
  }

  const next = timeline.upcoming[0];
  const mode = timeline.current.length > 0 ? "current"
    : next ? "upcoming"
      : remainingPendingDays.length > 0 ? "pending"
        : phase === "after" ? "after" : "empty";
  return { ...timeline, next, notices, phase, mode, pendingDays: remainingPendingDays };
}
