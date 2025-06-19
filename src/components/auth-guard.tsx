
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import LoadingSpinner from '@/components/loading-spinner';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      
      if (pathname !== '/login' && pathname !== '/signup') {
        
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!user) {
    
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <p>Redirecting to login...</p>
          <LoadingSpinner size={32} className="ml-2" />
        </div>
    );
  }

  return <>{children}</>;
}
