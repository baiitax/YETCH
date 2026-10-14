import type { NextResponse } from 'next/server';

export type CookieOptions = Parameters<NextResponse['cookies']['set']>[2];
export type CookieToSet = { name: string; value: string; options?: CookieOptions };
