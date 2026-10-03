export function pendingProgramBlocks(body: string) {
  return body.split(/\r?\n\s*\r?\n/).map(text => {
    // A start-only note is not a complete session. Keep the original detail and
    // do not invent a duration, location, access rule, or live/completed status.
    const match = /^([^:\n]+):\s*(\d{1,2}:\d{2}\s*[AP]M)([\s\S]*)$/i.exec(text.trim());
    return match
      ? { title: match[1]!.trim(), start: match[2]!, detail: match[3]!.replace(/^[;\s]+/, "").trim(), original: text }
      : { title: "", start: "", detail: text, original: text };
  });
}

const unconfirmedEnd = /^end time to be confirmed\.?$/i;
const accessCaveat = /^locations and access details to be confirmed\.?$/i;

// Public schedule view: omit the unconfirmed-end caveat and the generic access caveat.
// Start times, titles and any other supplied detail are kept exactly.
export function publicPendingProgramBlocks(body: string) {
  return pendingProgramBlocks(body)
    .filter(block => block.start || !accessCaveat.test(block.detail.trim()))
    .map(block => block.start && unconfirmedEnd.test(block.detail) ? { ...block, detail: "" } : block);
}
