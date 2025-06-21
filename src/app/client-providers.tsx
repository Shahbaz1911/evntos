'use client';

import { ReactLenis } from '@studio-freight/react-lenis';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import AuthGuard from '@/app/auth-guard';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <EventProvider>
            <SidebarProvider>
              <AuthGuard>
                <div className="flex flex-col flex-1 min-w-0 min-h-screen">
                  <Header />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                </div>
              </AuthGuard>
            </SidebarProvider>
            <Toaster />
          </EventProvider>
        </AuthProvider>
      </ThemeProvider>
    </ReactLenis>
  );
}
