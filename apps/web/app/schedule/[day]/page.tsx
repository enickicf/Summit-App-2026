import { groupPublishedProgramByDay } from "@not-alone/domain";
import { notFound } from "next/navigation";
import { getPublicSnapshotState } from "../../../lib/snapshot";
import SchedulePage from "../page";

// Oct 19 (Sophie, Sat): one address per Summit day for the printed QR codes, e.g. /schedule/2026-11-02 opens the
// schedule with Monday selected. Only a day that exists in the published schedule is a page; anything else is a 404.
// The five current addresses are listed literally in lib/page-cache.ts (edge cache) — update that list if the days change.
export const dayPattern = /^\d{4}-\d{2}-\d{2}$/;

export async function scheduleDayExists(day: string): Promise<boolean> {
  if (!dayPattern.test(day)) return false;
  const { snapshot } = await getPublicSnapshotState();
  return groupPublishedProgramByDay(snapshot).some(entry => entry.date === day);
}

export async function generateMetadata({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  if (!(await scheduleDayExists(day))) return { title: "Summit Schedule" };
  const { snapshot } = await getPublicSnapshotState();
  const label = groupPublishedProgramByDay(snapshot).find(entry => entry.date === day)?.dayLabel;
  return { title: label ? `Summit Schedule · ${label}` : "Summit Schedule" };
}

export default async function ScheduleDayPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = await params;
  if (!(await scheduleDayExists(day))) notFound();
  return SchedulePage({ initialDay: day });
}
