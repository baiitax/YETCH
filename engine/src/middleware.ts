import { NextResponse, type NextRequest } from 'next/server';
import { isAuthConfigured } from '@/lib/config';
import { refreshSession } from '@/lib/supabase/middleware';

// Paths that do not require a session. Everything else is protected by default.
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/auth/callback'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isAuthConfigured()) {
    if (isPublic(pathname)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '?status=unconfigured';
    return NextResponse.redirect(url);
  }

  const { response, user } = await refreshSession(request);
  if (isPublic(pathname)) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = pathname === '/' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)'],
};
