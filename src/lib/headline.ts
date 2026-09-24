/** Split an editorial headline on sentence boundaries: "Clean Cuts. Sharp Fades." → two lines. */
export function splitHeadline(headline: string): string[] {
  const trimmed = headline.trim();
  if (!trimmed) return [''];
  const parts = trimmed
    .split(/(?<=\.)\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [trimmed];
}
