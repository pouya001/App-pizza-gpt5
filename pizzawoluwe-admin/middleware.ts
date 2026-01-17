import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/orders', '/clients', '/pizzas', '/slots', '/settings'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorer les fichiers statiques et API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/public') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Vérifier la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();

  // Vérifier si la route est protégée
  const isProtected = protectedPaths.some(p => pathname.startsWith(p) || pathname === '/');

  // Si route protégée et pas de session → rediriger vers login
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si sur login et déjà connecté → rediriger vers dashboard
  if (pathname === '/login' && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
