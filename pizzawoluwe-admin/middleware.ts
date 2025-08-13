import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/orders', '/clients', '/pizzas', '/slots', '/settings'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Ignorer les fichiers statiques et API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/public') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Vérifier si la route est protégée
  const isProtected = protectedPaths.some(p => pathname.startsWith(p) || pathname === '/');
  
  // Vérifier si l'utilisateur est connecté via les cookies Supabase
  const hasSupabaseCookie = req.cookies.has('sb-access-token') || 
                           req.cookies.has('supabase-auth-token') ||
                           req.cookies.has('sb-refresh-token') ||
                           Array.from(req.cookies.getAll()).some(cookie => cookie.name.startsWith('sb-'));
  
  // Si route protégée et pas de cookie d'authentification → rediriger vers login
  if (isProtected && !hasSupabaseCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Si sur login et déjà connecté → rediriger vers dashboard
  if (pathname === '/login' && hasSupabaseCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
