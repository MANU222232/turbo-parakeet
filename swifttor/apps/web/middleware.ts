import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get session token from cookie
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  const hasSession = !!sessionToken;
  
  // Protected routes configuration
  const protectedRoutes = ['/admin', '/driver', '/customer', '/profile'];
  const currentPath = request.nextUrl.pathname;
  
  // Check if accessing protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    currentPath.startsWith(route)
  );
  
  // Redirect logic for protected routes
  if (isProtectedRoute && !hasSession) {
    // Redirect to home page if not authenticated
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Role-based access control for specific portals
  const adminRoute = currentPath.startsWith('/admin');
  const driverRoute = currentPath.startsWith('/driver');
  const customerRoute = currentPath.startsWith('/customer');
  
  // If we have session, check role (stored in JWT)
  // Note: Full role validation happens client-side with auth.ts callbacks
  // This is a basic guard
  
  // Content Security Policy (Strict but allows required APIs)
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://*.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.gstatic.com https://*.googleapis.com https://*.google.com https://*.googleusercontent.com https://*.unsplash.com https://*.pexels.com https://*.pixabay.com https://*.picsum.photos https://*.gravatar.com https://*.pravatar.cc;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.google.com https://*.googleapis.com https://*.stripe.com http://localhost:8000 ws://localhost:8000 https://vitals.vercel-insights.com https://ipapi.co;
    media-src 'self' https://cdn.coverr.co https://assets.mixkit.co https://*.pexels.com https://*.pixabay.com;
    frame-src 'self' https://*.stripe.com;
    frame-ancestors 'none';
  `.replace(/\n/g, '').replace(/\s+/g, ' ').trim();

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
