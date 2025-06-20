
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import LoadingSpinner from '@/components/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
}

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/']; 
const PUBLIC_PREFIXES = ['/e/', '/landing']; // Public event pages and explicit landing content

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      // If auth is resolved, user is not logged in, and it's not a public page, redirect to login
      router.push('/login');
    }
  }, [user, loading, router, pathname, isPublicPage]);

  if (loading && !isPublicPage) {
    // Show loading spinner only for protected routes while auth state is resolving
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isPublicPage && !user) {
    // This state might be brief as the useEffect above should trigger redirection,
    // but it handles cases where redirection hasn't happened yet.
    // It's important to not render children of protected routes if no user.
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
          <p className="text-muted-foreground mb-2">Redirecting to login...</p>
          <LoadingSpinner size={32} />
        </div>
    );
  }
  
  // For protected routes, after initial auth loading, if there's a user:
  if (!isPublicPage && user) {
    // If user is admin, allow access.
    if (isAdmin) {
      return <>{children}</>;
    }
    // If user is not admin:
    // **Conceptual Subscription Check Point for Future Implementation**
    // For now, allow logged-in non-admin users to access protected routes (e.g., dashboard).
    // In a real app with subscriptions, you would check user.subscriptionStatus here.
    // if (!user.subscriptionActive && pathname.startsWith('/dashboard')) { // or other protected paths
    //   router.push('/pricing'); // or a "please subscribe" page
    //   return (
    //     <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
    //       <p className="text-muted-foreground">Redirecting to pricing...</p>
    //       <LoadingSpinner size={32} className="ml-2" />
    //     </div>
    //   );
    // }
    // If subscription is active (or, for now, if it's a non-admin regular user), allow access.
    return <>{children}</>;
  }

  // If it's a public page, render children regardless of auth state (after initial auth loading if any)
  // Or if it's a protected page and the user is authenticated and meets criteria.
  return <>{children}</>;
}
