"use client";

import Link from "next/link";
import { useSyncExternalStore, type ComponentProps } from "react";
import { awardsHostSnapshot, summitOrigin } from "../lib/summit-links";

const subscribe = () => () => {};
const serverSnapshot = () => false;

// A link to a Summit page. On notaloneawards.org it becomes an absolute link to notalonesummit.org,
// because "/" on the Awards domain is a forced redirect to the Awards page (owner, Sept 23, 2026).
// Server markup stays relative; the browser upgrades the href after hydration without a mismatch.
export function SummitLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const awardsHost = useSyncExternalStore(subscribe, awardsHostSnapshot, serverSnapshot);
  if (awardsHost) return <a href={`${summitOrigin}${href}`} {...props} />;
  return <Link href={href} {...props} />;
}
