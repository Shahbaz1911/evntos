
"use client";
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    CalendarPlus, LogIn, LogOut, UserPlus, UserCircle, QrCode, LayoutDashboard, Menu, X, Home, Info, ArrowRight, Star, HelpCircle, DollarSign, Settings, CreditCard, ShieldCheck, ShoppingCart, Zap, MoreVertical
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useRef } from 'react';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar'; 
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive: boolean;
  className?: string;
  isMobile?: boolean;
}

const NavLink = ({ href, children, onClick, isActive, className, isMobile = false }: NavLinkProps) => {
    const baseClasses = `text-sm font-medium transition-colors rounded-full px-4 py-1.5 flex items-center`;
    const activeClasses = `text-primary bg-primary/10`;
  
    if (isMobile) {
      const mobileInactiveClasses = `text-foreground/70 hover:text-primary hover:bg-primary/10`;
      return (
        <Button
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            baseClasses,
            'gap-2',
            isActive ? activeClasses : mobileInactiveClasses,
            className
          )}
          data-active={isActive}
          onClick={onClick}
        >
          <Link href={href} className="flex items-center justify-between w-full">
             <span className="flex items-center gap-2">{children}</span>
             <ArrowRight className={cn("h-4 w-4 shrink-0 text-primary transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")} />
          </Link>
        </Button>
      );
    }
  
    const inactiveClasses = `text-foreground/70 hover:text-primary hover:bg-primary/5`;
  
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Button
          variant="ghost"
          size="sm"
          asChild
          className={cn(
            baseClasses,
            isActive ? activeClasses : inactiveClasses,
            'group',
            className
          )}
          data-active={isActive}
          onClick={onClick}
        >
          <Link href={href} className="flex items-center gap-1.5">
            {children}
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </motion.div>
    );
  };


const MobileSidebarContent = ({ activeSection, commonNavLinks }: { activeSection: string; commonNavLinks: Array<{ href: string; label: string; id: string; icon: React.ElementType }> }) => {
  const { user, logOut, loading, isAdmin, userSubscriptionStatus } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar(); 
  const { toast } = useToast();

  const closeMobileMenu = () => setOpenMobile(false);

  const handleLogout = async () => {
    try {
      await logOut(); 
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "destructive",
      });
      closeMobileMenu();
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
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

  const planName = userSubscriptionStatus !== 'none' && userSubscriptionStatus !== 'loading' 
    ? userSubscriptionStatus.charAt(0).toUpperCase() + userSubscriptionStatus.slice(1) 
    : "None";

  const subscriptionText = isAdmin ? "Admin Access" : `Plan: ${planName}`;
  const SubscriptionIcon = isAdmin ? ShieldCheck : ShoppingCart;


  return (
    <>
      <div className="flex justify-between items-center p-4 border-b">
        <Link href="/" className="text-xl font-bold text-primary" onClick={closeMobileMenu}>
          evntos
        </Link>
      </div>

      {user && (
        <>
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User Avatar'} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className={cn("text-xs leading-none mt-1 flex items-center", isAdmin || (userSubscriptionStatus !== 'none' && userSubscriptionStatus !== 'loading') ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                <SubscriptionIcon className="mr-1 h-3 w-3" /> 
                {subscriptionText}
              </div>
            </div>
          </div>
          <Separator className="my-2" />
        </>
      )}
      
      <nav className="flex-grow p-4 space-y-1">
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
            <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
            <div className="h-10 w-full bg-muted/50 animate-pulse rounded-md"></div>
          </div>
        ) : user ? (
          <>
            <NavLink href="/dashboard" isActive={pathname === "/dashboard"} onClick={closeMobileMenu} className="w-full justify-start text-base py-3" isMobile>
              <LayoutDashboard className="mr-2 h-5 w-5"/>My Dashboard
            </NavLink>
            <NavLink href="/events/create" isActive={pathname === "/events/create"} onClick={closeMobileMenu} className="w-full justify-start text-base py-3" isMobile>
              <CalendarPlus className="mr-2 h-5 w-5"/>Create Event
            </NavLink>
            <NavLink href="/scan-dashboard" isActive={pathname === "/scan-dashboard"} onClick={closeMobileMenu} className="w-full justify-start text-base py-3" isMobile>
              <QrCode className="mr-2 h-5 w-5"/>Scan Dashboard
            </NavLink>
            {!isAdmin && userSubscriptionStatus === 'none' && (
                <NavLink href="/pricing" isActive={pathname === "/pricing"} onClick={closeMobileMenu} className="w-full justify-start text-base py-3 bg-primary/5 hover:bg-primary/15 text-primary" isMobile>
                    <CreditCard className="mr-2 h-5 w-5"/> View Plans
                </NavLink>
            )}
          </>
        ) : (
            commonNavLinks.map(link => {
            let isLinkActive = false;
            if (pathname === '/') {
                if (activeSection) {
                isLinkActive = activeSection === link.id;
                } else if (link.id === commonNavLinks[0].id) {
                isLinkActive = true;
                }
            } else {
                isLinkActive = pathname === link.href;
            }
            return (
              <NavLink key={link.href} href={link.href} isActive={isLinkActive} onClick={closeMobileMenu} className="w-full justify-start text-base py-3" isMobile>
                <link.icon className="mr-2 h-5 w-5" /> {link.label}
              </NavLink>
            );
            })
        )}
      </nav>
      <div className="p-4 border-t mt-auto">
        {user ? (
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive focus-visible:ring-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button asChild variant="ghost" className="w-full text-accent hover:text-accent hover:bg-accent/10 text-base py-3" onClick={closeMobileMenu}>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" onClick={closeMobileMenu}>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};


export default function Header() {
  const { user, logOut, loading, isAdmin, userSubscriptionStatus } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { openMobile, setOpenMobile } = useSidebar(); 
  const [activeSection, setActiveSection] = useState('');
  const { toast } = useToast();
  const [showHeader, setShowHeader] = useState(pathname !== '/');
  

  useEffect(() => {
    const headerElement = document.querySelector('header');
    if (headerElement) {
      const headerHeight = headerElement.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
        setShowHeader(true);
        return;
    }

    const handleScroll = () => {
        // Show header after scrolling past 90% of the first screen height
        if (window.scrollY > window.innerHeight * 0.9) {
            setShowHeader(true);
        } else {
            setShowHeader(false);
        }
    };

    // Initial check in case of page refresh at a scrolled position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);
  

  const commonNavLinks = [
    { href: "/#hero", label: "Home", id: "hero", icon: Home },
    { href: "/#features", label: "Features", id: "features", icon: Zap },
    { href: "/#about", label: "About", id: "about", icon: Info },
    { href: "/#pricing", label: "Pricing", id: "pricing", icon: DollarSign },
    { href: "/#testimonials", label: "Testimonials", id: "testimonials", icon: Star },
    { href: "/#faq", label: "FAQ", id: "faq", icon: HelpCircle },
  ];

  useEffect(() => {
    if (typeof window === 'undefined' || pathname !== '/') return;

    let initialSectionId = '';
    if (window.location.hash && window.location.hash !== '#') {
        initialSectionId = window.location.hash.substring(1);
    } else if (commonNavLinks.length > 0) {
        initialSectionId = commonNavLinks[0].id;
    }
    setActiveSection(initialSectionId);

    const sectionElements = commonNavLinks
      .map(link => document.getElementById(link.id))
      .filter(el => el !== null) as HTMLElement[];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const activationPoint = 100; 
      let newActiveSectionId = '';

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.offsetTop <= scrollY + activationPoint) {
          newActiveSectionId = section.id;
          break;
        }
      }

      if (!newActiveSectionId && scrollY < activationPoint && sectionElements.length > 0) {
        newActiveSectionId = sectionElements[0].id;
      }
      
      const bottomReached = window.innerHeight + scrollY >= document.body.offsetHeight - 50;
      if (bottomReached && sectionElements.length > 0) {
         newActiveSectionId = sectionElements[sectionElements.length - 1].id;
      }

      setActiveSection(newActiveSectionId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

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

  const planName = userSubscriptionStatus !== 'none' && userSubscriptionStatus !== 'loading' 
    ? userSubscriptionStatus.charAt(0).toUpperCase() + userSubscriptionStatus.slice(1) 
    : "None";

  const subscriptionText = isAdmin ? "Admin Access" : `Plan: ${planName}`;
  const SubscriptionIcon = isAdmin ? ShieldCheck : ShoppingCart;


  return (
    <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "transition-all duration-300 ease-in-out",
        showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity text-primary">
            evntos
          </Link>
          
          <nav className="hidden md:flex flex-1 items-center justify-center">
             <div className="flex items-center gap-0.5 rounded-full bg-card p-1 shadow-sm border border-border/80">
                {loading ? (
                  <>
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                    <Separator orientation="vertical" className="h-4 bg-border/70" />
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                     <Separator orientation="vertical" className="h-4 bg-border/70" />
                    <div className="h-8 w-20 bg-muted/50 animate-pulse rounded-full"></div>
                  </>
                ) : user ? (
                  <>
                    <NavLink href="/dashboard" isActive={pathname === "/dashboard"}>
                      <LayoutDashboard />
                      Dashboard
                    </NavLink>
                     <Separator orientation="vertical" className="h-4 mx-1 bg-border/70" />
                    <NavLink href="/events/create" isActive={pathname === "/events/create"}>
                      <CalendarPlus/>
                      Create Event
                    </NavLink>
                  </>
                ) : (
                  commonNavLinks.map((link, index) => {
                    let isLinkActive = false;
                    if (pathname === '/') { 
                      if (activeSection) {
                        isLinkActive = activeSection === link.id;
                      } else if (link.id === commonNavLinks[0].id) { 
                        isLinkActive = true;
                      }
                    } else {
                      isLinkActive = pathname === link.href; 
                    }
                    return (
                      <React.Fragment key={link.href}>
                        <NavLink href={link.href} isActive={isLinkActive}>
                          {link.label}
                        </NavLink>
                        {index < commonNavLinks.length - 1 && <Separator orientation="vertical" className="h-4 mx-1 bg-border/70" />}
                      </React.Fragment>
                    );
                  })
                )}
             </div>
          </nav>

          <div className="hidden md:flex items-center gap-2">
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
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                       <div className={cn("text-xs leading-none mt-1.5 pt-1 border-t border-border/50 flex items-center", isAdmin || (userSubscriptionStatus !== 'none' && userSubscriptionStatus !== 'loading') ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
                         <SubscriptionIcon className="mr-1.5 h-3.5 w-3.5" /> 
                         {subscriptionText}
                       </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/scan-dashboard" className="flex items-center">
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan Dashboard
                      </Link>
                  </DropdownMenuItem>
                  {!isAdmin && userSubscriptionStatus === 'none' && (
                    <DropdownMenuItem asChild className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10">
                        <Link href="/pricing" className="flex items-center">
                            <CreditCard className="mr-2 h-4 w-4" />
                            View Plans
                        </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await logOut();
                        toast({
                          title: "Logged Out",
                          description: "You have been successfully logged out.",
                          variant: "destructive",
                        });
                      } catch (error) {
                         console.error("Logout error:", error);
                         toast({
                          title: "Logout Error",
                          description: "Failed to log out. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }} 
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-accent hover:text-accent hover:bg-accent/5">
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
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-full p-0 bg-background flex flex-col" data-sidebar="sidebar" data-mobile="true">
                <MobileSidebarContent activeSection={activeSection} commonNavLinks={commonNavLinks} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
