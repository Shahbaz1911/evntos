
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CalendarPlus, LogIn, LogOut, UserPlus, UserCircle, QrCode, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react';

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <Button variant="ghost" size="sm" asChild className="text-foreground/80 hover:text-primary hover:bg-transparent data-[active=true]:text-primary data-[active=true]:font-semibold">
    <Link href={href} onClick={onClick}>{children}</Link>
  </Button>
);


export default function Header() {
  const { user, logOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Calculate header height and set as CSS variable
    const headerElement = document.querySelector('header');
    if (headerElement) {
      const headerHeight = headerElement.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }, []);

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    const nameParts = user?.displayName?.split(' ') || [];
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0].substring(0,2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const commonNavLinks = [
    { href: "/#hero", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#services", label: "Services" },
    { href: "/#testimonials", label: "Testimonials" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-background text-foreground shadow-md sticky top-0 z-50 border-b border-border/60">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity text-primary">
          eventos
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {!user && !loading && commonNavLinks.map(link => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
          
          {loading ? (
            <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="text-foreground/80 hover:text-primary">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  My Dashboard
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/events/create">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User Avatar'} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/dashboard" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/scan-dashboard" className="flex items-center">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan Dashboard
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-transparent">
                <Link href="/login">
                  Login
                </Link>
              </Button>
              <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 bg-background">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                   <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-primary" onClick={closeMobileMenu}>
                    eventos
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-full bg-muted/50 animate-pulse rounded-md"></div>
                      <div className="h-8 w-full bg-muted/50 animate-pulse rounded-md"></div>
                      <div className="h-8 w-full bg-muted/50 animate-pulse rounded-md"></div>
                    </div>
                  ) : user ? (
                    <>
                      <NavLink href="/dashboard" onClick={closeMobileMenu}><LayoutDashboard className="mr-2"/>My Dashboard</NavLink>
                      <NavLink href="/events/create" onClick={closeMobileMenu}><CalendarPlus className="mr-2"/>Create Event</NavLink>
                      <NavLink href="/scan-dashboard" onClick={closeMobileMenu}><QrCode className="mr-2"/>Scan Dashboard</NavLink>
                    </>
                  ) : (
                    commonNavLinks.map(link => <NavLink key={link.href} href={link.href} onClick={closeMobileMenu}>{link.label}</NavLink>)
                  )}
                </nav>
                <div className="p-4 border-t mt-auto">
                  {user ? (
                     <Button onClick={() => { logOut(); closeMobileMenu();}} variant="outline" className="w-full text-destructive hover:bg-destructive/10">
                       <LogOut className="mr-2 h-4 w-4" />
                       Log out
                     </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="w-full text-accent hover:text-accent/80" onClick={closeMobileMenu}>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={closeMobileMenu}>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
