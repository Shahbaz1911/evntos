
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import LoadingSpinner from '@/components/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/']; 
const PUBLIC_PREFIXES = ['/e/', '/landing']; 
// Checkout page is public in the sense that you don't need a subscription yet,
// but you DO need to be logged in to access it.
const LOGIN_REQUIRED_BUT_NO_SUBSCRIPTION_PREFIXES = ['/checkout/'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isAdmin, userSubscriptionStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isCheckoutPage = LOGIN_REQUIRED_BUT_NO_SUBSCRIPTION_PREFIXES.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (!loading) { // Only run checks after initial auth state load
      if (!user && !isPublicPage) {
        // If auth is resolved, user is not logged in, and it's not a public page, redirect to login
        router.push('/login');
      } else if (user && !isPublicPage && !isCheckoutPage) {
        // User is logged in, on a protected page (not public, not checkout)
        if (!isAdmin && userSubscriptionStatus !== 'active') {
          // Regular user without active subscription, redirect to pricing
          toast({
            title: "Subscription Required",
            description: "Please choose a plan to access this page.",
            variant: "default", 
          });
          router.push('/pricing');
        }
      } else if (user && isCheckoutPage && userSubscriptionStatus === 'active' && !isAdmin){
        // If user is already subscribed and tries to go to checkout, send to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, pathname, isPublicPage, isCheckoutPage, isAdmin, userSubscriptionStatus, toast]);

  // Initial loading state for the entire app, handled by AuthProvider.
  // This guard handles loading for route transitions after initial auth.
  if (loading && !isPublicPage) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // If not a public page and no user (should be caught by useEffect, but as a fallback)
  if (!isPublicPage && !user) {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
          <p className="text-muted-foreground mb-2">Redirecting to login...</p>
          <LoadingSpinner size={32} />
        </div>
    );
  }
  
  // If it's a protected route, user is logged in, but not admin and no active subscription (and not checkout page)
  if (!isPublicPage && !isCheckoutPage && user && !isAdmin && userSubscriptionStatus !== 'active') {
     return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background">
          <p className="text-muted-foreground mb-2">Redirecting to pricing...</p>
          <LoadingSpinner size={32} />
        </div>
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
}
