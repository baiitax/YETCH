// Shared helpers for server actions. Not a server-action module, so these are not callable from the browser.
import { safeNextPath } from '@/lib/security';

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

/** Builds a same-site URL with query parameters. The base path is validated. */
export function withParams(path: string, params: Record<string, string | undefined | null>, fallback = '/dashboard'): string {
  const base = safeNextPath(path, fallback);
  const [pathname, existing = ''] = base.split('?');
  const search = new URLSearchParams(existing);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') search.delete(key);
    else search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
