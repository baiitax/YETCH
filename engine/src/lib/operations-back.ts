// Return links for operations forms. Only known internal pages are accepted, so a form cannot redirect off-site.
const ALLOWED: RegExp[] = [
  /^\/operations(\/(tasks|campaigns|approvals))?$/,
  /^\/customers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
];

export function safeBack(raw: string, fallback: string): string {
  return ALLOWED.some((pattern) => pattern.test(raw)) ? raw : fallback;
}
