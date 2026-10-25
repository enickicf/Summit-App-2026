import { createHmac, timingSafeEqual } from "node:crypto";

// Owner (Sept 23): the staff portal is protected by a single shared password (no usernames). The
// password lives in the hosting environment (STAFF_PORTAL_PASSWORD); a signed cookie keeps the browser
// signed in for 30 days. Changing the password signs everyone out.
export const staffCookieName = "na_staff";
export const staffCookieMaxAgeSeconds = 30 * 24 * 60 * 60;
type StaffEnv = { STAFF_PORTAL_PASSWORD?: string | undefined };
const processEnv = () => process.env as StaffEnv;

export function staffPassword(env: StaffEnv = processEnv()): string | null {
  const value = env.STAFF_PORTAL_PASSWORD?.trim();
  return value ? value : null;
}

function sign(password: string): string {
  return createHmac("sha256", `not-alone-staff-portal:${password}`).update("signed-in").digest("hex");
}

export function staffSessionToken(password: string): string {
  return `v1.${sign(password)}`;
}

export function passwordMatches(candidate: string, env: StaffEnv = processEnv()): boolean {
  const expected = staffPassword(env);
  if (!expected) return false;
  const a = Buffer.from(candidate.normalize());
  const b = Buffer.from(expected.normalize());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isStaffSession(token: string | undefined, env: StaffEnv = processEnv()): boolean {
  const expected = staffPassword(env);
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(staffSessionToken(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

// Oct 24: podcast partners may review interview bookings without receiving access to RSVPs,
// nominations, guest contact lists, waivers, or any other staff data.
export const podcastStaffCookieName = "na_podcast_staff";
type PodcastStaffEnv = { PODCAST_PORTAL_PASSWORD?: string | undefined };
const podcastStaffEnv = () => process.env as PodcastStaffEnv;
export function podcastStaffPassword(env: PodcastStaffEnv = podcastStaffEnv()): string | null {
  const value = env.PODCAST_PORTAL_PASSWORD?.trim();
  return value ? value : null;
}
export function podcastStaffSessionToken(password: string): string {
  return `v1.${createHmac("sha256", `not-alone-podcast-staff:${password}`).update("signed-in").digest("hex")}`;
}
export function podcastStaffPasswordMatches(candidate: string, env: PodcastStaffEnv = podcastStaffEnv()): boolean {
  const expected = podcastStaffPassword(env);
  return expected ? sameBytes(Buffer.from(candidate.normalize()), Buffer.from(expected.normalize())) : false;
}
export function isPodcastStaffSession(token: string | undefined, env: PodcastStaffEnv = podcastStaffEnv()): boolean {
  const expected = podcastStaffPassword(env);
  return expected && token ? sameBytes(Buffer.from(token), Buffer.from(podcastStaffSessionToken(expected))) : false;
}

// Owner (Sept 30, 2026): VIP data has its own portal and its own password, so only the staff who are
// given it can see VIP guests. The regular staff password never opens it, and vice versa. Unset = locked.
export const vipCookieName = "na_vip";
type VipEnv = { VIP_PORTAL_PASSWORD?: string | undefined };
const vipEnv = () => process.env as VipEnv;
export function vipPassword(env: VipEnv = vipEnv()): string | null {
  const value = env.VIP_PORTAL_PASSWORD?.trim();
  return value ? value : null;
}
export function vipSessionToken(password: string): string {
  return `v1.${createHmac("sha256", `not-alone-vip-portal:${password}`).update("signed-in").digest("hex")}`;
}
function sameBytes(a: Buffer, b: Buffer) { return a.length === b.length && timingSafeEqual(a, b); }
export function vipPasswordMatches(candidate: string, env: VipEnv = vipEnv()): boolean {
  const expected = vipPassword(env);
  return expected ? sameBytes(Buffer.from(candidate.normalize()), Buffer.from(expected.normalize())) : false;
}
export function isVipSession(token: string | undefined, env: VipEnv = vipEnv()): boolean {
  const expected = vipPassword(env);
  return expected && token ? sameBytes(Buffer.from(token), Buffer.from(vipSessionToken(expected))) : false;
}
