/** Parse an optional numeric input: "" -> null, else truncated Number(value). */
export function parseOptionalInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : Math.trunc(n);
}
