
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { EventProvider } from '@/context/EventContext';
import { AuthProvider } from '@/context/AuthContext'; 
import { ThemeProvider } from 'next-themes';
import { SidebarProvider } from '@/components/ui/sidebar'; 
import AuthGuard from '@/app/auth-guard'; // Import the new global AuthGuard
import { ReactLenis } from '@studio-freight/react-lenis';

export const metadata: Metadata = {
  title: 'evntos',
  description: 'Create, promote, and manage your events effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
                      <main className="flex-grow">
                        {children}
                      </main>
                      <Footer />
                    </div>
                  </AuthGuard>
                </SidebarProvider>
                <Toaster />
              </EventProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReactLenis>
      </body>
    </html>
  );
}
