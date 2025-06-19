
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
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Separator } from '@/components/ui/separator'; // Added Separator

const NavLink = ({ 
  href, 
  children, 
  onClick,
  currentPathname
}: { 
  href: string; 
  children: React.ReactNode; 
  onClick?: () => void;
  currentPathname: string;
}) => {
  const isActive = currentPathname === href || (href.includes("#") && currentPathname === href.substring(0, href.indexOf("#")));
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      asChild 
      className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary bg-primary/10' : 'text-foreground/70 hover:text-foreground'} rounded-full px-4 py-1.5`}
      data-active={isActive}
      onClick={onClick}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};


export default function Header() {
  const { user, logOut, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity text-orange-500">
            eventos
          </Link>
          
          <nav className="hidden md:flex flex-1 items-center justify-center">
             <div className="flex items-center gap-1 rounded-full bg-card p-1 shadow-sm border border-border/80">
                {loading ? (
                  <>
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                  </>
                ) : user ? (
                  <>
                    <NavLink href="/dashboard" currentPathname={pathname}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </NavLink>
                    <NavLink href="/events/create" currentPathname={pathname}>
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Create Event
                    </NavLink>
                  </>
                ) : (
                  commonNavLinks.map(link => <NavLink key={link.href} href={link.href} currentPathname={pathname}>{link.label}</NavLink>)
                )}
             </div>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Added Separator here for desktop */}
            {!loading && <Separator orientation="vertical" className="h-6 mx-2" />} 
            <ThemeToggleButton />
            {loading ? (
              <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-md"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
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
          </div>

          <div className="md:hidden flex items-center gap-2">
             <ThemeToggleButton />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 bg-background flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                   <Link href={user ? "/dashboard" : "/"} className="text-xl font-bold text-orange-500" onClick={closeMobileMenu}>
                    eventos
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex-grow p-4 space-y-1">
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
                      <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
                      <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
                    </div>
                  ) : user ? (
                    <>
                      <NavLink href="/dashboard" currentPathname={pathname} onClick={closeMobileMenu}><LayoutDashboard className="mr-2 h-5 w-5"/>My Dashboard</NavLink>
                      <NavLink href="/events/create" currentPathname={pathname} onClick={closeMobileMenu}><CalendarPlus className="mr-2 h-5 w-5"/>Create Event</NavLink>
                      <NavLink href="/scan-dashboard" currentPathname={pathname} onClick={closeMobileMenu}><QrCode className="mr-2 h-5 w-5"/>Scan Dashboard</NavLink>
                    </>
                  ) : (
                    commonNavLinks.map(link => <NavLink key={link.href} href={link.href} currentPathname={pathname} onClick={closeMobileMenu}>{link.label}</NavLink>)
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
                      <Button asChild variant="ghost" className="w-full text-accent hover:text-accent/80" onClick={closeMobileMenu}>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" onClick={closeMobileMenu}>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
