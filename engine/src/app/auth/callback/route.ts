import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { isAuthConfigured } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/security';

// Completes email links (password reset, invitation). Accepts PKCE codes and token-hash links.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get('next'), '/dashboard');
  const fail = () => NextResponse.redirect(new URL('/login?error=link_invalid', url.origin));
  if (!isAuthConfigured()) return fail();

  const supabase = await createClient();
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail();
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return fail();
  } else {
    return fail();
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
