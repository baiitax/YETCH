import 'server-only';
import { cache } from 'react';
import { isAuthConfigured } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { isRole, type Role } from '@/lib/domain/rbac';

export type Session =
  | { state: 'unconfigured' }
  | { state: 'signed_out' }
  | { state: 'inactive'; email: string }
  | { state: 'active'; userId: string; email: string; fullName: string; role: Role };

/**
 * Current user and role for this request. Role comes from the database (current_app_role), which returns
 * null for inactive or missing profiles. Cached per request so layouts and pages share one lookup.
 */
export const getSession = cache(async (): Promise<Session> => {
  if (!isAuthConfigured()) return { state: 'unconfigured' };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { state: 'signed_out' };

  const { data: role } = await supabase.rpc('current_app_role');
  if (!isRole(role)) return { state: 'inactive', email: user.email ?? '' };

  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', user.id).maybeSingle();
  return {
    state: 'active',
    userId: user.id,
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name ?? '',
    role,
  };
});
