import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { config, serviceRoleKey } from '@/lib/config';

/**
 * Administrative client with the service-role key. Used only by the founder invitation action.
 * It is never imported by a client component, and the key is never returned to the browser.
 */
export function createAdminClient() {
  const key = serviceRoleKey();
  if (!key) return null;
  return createClient(config.supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
