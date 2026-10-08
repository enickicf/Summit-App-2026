import { Fragment } from "react";
import { awards2026Editorial } from "../lib/awards-editorial";

// Owner (Oct 8, 2026): the Cohen Foundation credit in the Summit and Awards heroes is a compact stack — a small
// "Powered by" label over the foundation's name on two balanced lines ("Steven & Alexandra" / "Cohen Foundation") —
// instead of one long line that wrapped unevenly on wide screens. The wording itself is unchanged; the split is
// fixed in the markup so every browser and width breaks the name in the same place.
export function stackedFoundationName(name: string = awards2026Editorial.foundation): string[] {
  const at = name.indexOf(" Cohen ");
  return at > 0 ? [name.slice(0, at), name.slice(at + 1)] : [name];
}

export function PoweredBy({ className }: { className?: string | undefined }) {
  return <p className={className}>Powered by<strong>{stackedFoundationName().map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</strong></p>;
}
