
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/orders', '/clients', '/pizzas', '/slots', '/settings'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/public') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  const isProtected = protectedPaths.some(p => pathname.startsWith(p) || pathname === '/');
  const accessToken = req.cookies.get('sb-access-token')?.value || 
                   req.cookies.get('supabase-auth-token')?.value ||
                   req.cookies.get('sb-refresh-token')?.value;
  if (isProtected && !accessToken) {
    const url = req.nextUrl.clone(); url.pathname = '/login'; return NextResponse.redirect(url);
  }
  if (pathname === '/login' && accessToken) {
    const url = req.nextUrl.clone(); url.pathname = '/dashboard'; return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
