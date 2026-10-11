import { Fragment } from "react";

// Oct 11: a title can carry a second line ("ICF Alumni" then the person's title underneath, Ryan / owner). The text
// keeps a "\n" between the lines; this renders them as separate lines inside the existing role element.
export function RoleLines({ text }: { text: string }) {
  if (!text.includes("\n")) return <>{text}</>; // single-line titles render exactly as before
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  return <>{lines.map((line, index) => <Fragment key={index}>{index > 0 && <br />}{line}</Fragment>)}</>;
}
