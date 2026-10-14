// Converts bigint money values to JSON numbers. Values are capped at 13 whole digits, so they stay exact.
export function jsonSafe<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = typeof value === 'bigint' ? Number(value) : value;
  }
  return out;
}
