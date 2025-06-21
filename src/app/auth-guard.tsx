
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import LoadingSpinner from '@/components/loading-spinner';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = ['/login', '/signup', '/', '/pricing'];
const PUBLIC_PREFIXES = ['/e/', '/landing'];
const LOGIN_REQUIRED_BUT_NO_SUBSCRIPTION_PREFIXES = ['/checkout/'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authContextLoading, isAdmin, userSubscriptionStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
  const isCheckoutPage = LOGIN_REQUIRED_BUT_NO_SUBSCRIPTION_PREFIXES.some(prefix => pathname.startsWith(prefix));

  useEffect(() => {
    if (!authContextLoading && userSubscriptionStatus !== 'loading') {
      if (!user && !isPublicPage) {
        router.push('/login');
      } else if (user && !isPublicPage && !isCheckoutPage) {
        if (!isAdmin && userSubscriptionStatus === 'none') {
          if (pathname !== '/pricing') { 
            toast({
              title: "Subscription Required",
              description: "Please choose a plan to access this page.",
              variant: "default",
            });
            router.push('/pricing');
          }
        }
      } else if (user && isCheckoutPage && userSubscriptionStatus !== 'none' && !isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [user, authContextLoading, userSubscriptionStatus, router, pathname, isPublicPage, isCheckoutPage, isAdmin, toast]);

  if ((authContextLoading || userSubscriptionStatus === 'loading') && !isPublicPage) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background px-4">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!isPublicPage && !user && !authContextLoading && userSubscriptionStatus !== 'loading') {
    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background px-4">
          <p className="text-muted-foreground mb-2 text-center">Redirecting to login...</p>
          <LoadingSpinner size={32} />
        </div>
    );
  }

  if (!isPublicPage && !isCheckoutPage && user && !isAdmin && userSubscriptionStatus === 'none' && !authContextLoading && userSubscriptionStatus !== 'loading') {
     if (pathname !== '/pricing') {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))] bg-background px-4">
            <p className="text-muted-foreground mb-2 text-center">Redirecting to pricing...</p>
            <LoadingSpinner size={32} />
            </div>
        );
     }
  }

  return <>{children}</>;
}
