import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

type UserRole = 'customer' | 'driver' | 'shop_owner' | 'admin';

interface UseRoleRedirectOptions {
  allowedRoles?: UserRole[];
  fallbackUrl?: string;
}

/**
 * Hook to redirect users based on their role
 * Usage: In any page component, call useRoleRedirect({ allowedRoles: ['customer'] })
 */
export function useRoleRedirect(options: UseRoleRedirectOptions = {}) {
  const { allowedRoles = [], fallbackUrl = '/' } = options;
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    // Not authenticated - redirect to home
    if (status === 'unauthenticated') {
      router.push(fallbackUrl);
      return;
    }

    // Get user role from session
    const userRole = (session?.user as any)?.role as UserRole | undefined;

    if (!userRole) {
      console.warn('No role found in session');
      return;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard
      const roleDashboard = getRoleDashboard(userRole);
      
      if (fallbackUrl) {
        router.push(fallbackUrl);
      } else if (roleDashboard && roleDashboard !== pathname) {
        router.push(roleDashboard);
      }
      return;
    }
  }, [session, status, router, pathname, allowedRoles, fallbackUrl]);

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    role: (session?.user as any)?.role as UserRole | undefined,
  };
}

// Helper function to get dashboard URL by role
function getRoleDashboard(role: UserRole): string {
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

// Convenience hooks for specific roles
export function useCustomerOnly() {
  return useRoleRedirect({ allowedRoles: ['customer'] });
}

export function useDriverOnly() {
  return useRoleRedirect({ allowedRoles: ['driver'] });
}

export function useAdminOnly() {
  return useRoleRedirect({ allowedRoles: ['admin'] });
}

export function useShopOwnerOnly() {
  return useRoleRedirect({ allowedRoles: ['shop_owner'] });
}
