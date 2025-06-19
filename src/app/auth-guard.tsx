
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import LoadingSpinner from '@/components/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string; // Optional: specify where to redirect if not authenticated
}

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/']; // Root path is public landing
const PUBLIC_PREFIXES = ['/e/', '/landing']; // Public event pages and explicit landing

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (!loading && !user && !isPublicPage) {
      router.push(redirectTo);
    }
  }, [user, loading, router, pathname, isPublicPage, redirectTo]);

  if (loading && !isPublicPage) {
    // Show loading spinner only for protected routes while auth state is resolving
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))] bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!user && !isPublicPage) {
    // If still not authenticated and it's a protected page, show redirecting message
    // This state might be brief as the useEffect above should trigger redirection
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))] bg-background">
          <p className="text-muted-foreground">Redirecting to login...</p>
          <LoadingSpinner size={32} className="ml-2" />
        </div>
    );
  }

  // If it's a public page, or user is authenticated, render children
  return <>{children}</>;
}
