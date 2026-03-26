'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type UserRole = 'customer' | 'driver' | 'shop_owner' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['customer', 'driver', 'shop_owner'],
  fallbackPath = '/'
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    // Not authenticated - redirect to home
    if (status === 'unauthenticated') {
      router.push(fallbackPath);
      return;
    }

    // Check role authorization
    if (session && allowedRoles.length > 0) {
      const userRole = (session.user as any)?.role;
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user's actual role
        const roleBasedPath = getRoleDashboard(userRole);
        if (roleBasedPath && roleBasedPath !== pathname) {
          router.push(roleBasedPath);
          return;
        }
      }
      
      setIsAuthorized(true);
    }
    
    setIsLoading(false);
  }, [session, status, router, pathname, allowedRoles]);

  // Show loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authorized - will redirect
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

// Helper function to get appropriate dashboard for role
function getRoleDashboard(role: UserRole | undefined): string | null {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'driver':
      return '/driver';
    case 'customer':
      return '/customer';
    case 'shop_owner':
      return '/shops';
    default:
      return '/';
  }
}

// HOC for easier usage
export function withProtected<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function ProtectedWrappedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}
