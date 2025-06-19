
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarPlus, LogIn, LogOut, UserPlus, UserCircle, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logOut, loading } = useAuth();

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

  return (
    <header className="bg-background text-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold font-headline hover:opacity-90 transition-opacity text-orange-500">
          eventos
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {loading ? (
            <div className="h-10 w-24 bg-muted/50 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
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
                  <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                     <Link href="/events/create" className="flex items-center">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Create Event
                      </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href="/" className="flex items-center">
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
                  <DropdownMenuSeparator className="sm:hidden"/>
                  <DropdownMenuItem onClick={logOut} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground text-foreground/80">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

