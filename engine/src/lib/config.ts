// Environment configuration. Values are read at build or request time. Missing values produce a visible
// "not configured" state. The app never falls back to a default password, a default key or a fake backend.

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  /** Public origin of this engine, used in password-reset links. For example https://engine.yech.sa */
  publicUrl: process.env.ENGINE_PUBLIC_URL ?? '',
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL ?? '',
} as const;

export function isAuthConfigured(): boolean {
  return /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(config.supabaseUrl) && config.supabaseAnonKey.length > 20;
}

export function isResetConfigured(): boolean {
  return isAuthConfigured() && /^https?:\/\//.test(config.publicUrl);
}

/** Service-role access is only for the founder invitation action. It is read here, never exposed to the browser. */
export function serviceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return key.length > 20 ? key : null;
}
