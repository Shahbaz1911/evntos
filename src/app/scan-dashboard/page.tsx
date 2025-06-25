
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
// import AuthGuard from '@/components/auth-guard'; // Removed page-level AuthGuard
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { QrCode, CalendarX2, ArrowRight, Search } from 'lucide-react';
import type { Event } from '@/types';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ScanDashboardPage() {
  const { events, contextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const userEvents = useMemo(() => {
    if (!authUser || !events) return [];
    return events.filter(event => event.userId === authUser.uid)
                 .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [events, authUser]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return userEvents;
    return userEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userEvents, searchQuery]);

  const isLoading = contextLoading || authLoading;

  return (
    // <AuthGuard> // Removed page-level AuthGuard
      <div className="space-y-8 container mx-auto px-4 py-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline text-primary">Scan Tickets Dashboard</CardTitle>
            <CardDescription>Select an event below to start scanning tickets.</CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size={64} />
          </div>
        ) : userEvents.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <CalendarX2 className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-2">No Events Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't created any events yet. Create an event to enable ticket scanning.
              </p>
              <Button asChild>
                <Link href="/events/create">Create New Event</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for an event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-1/2 lg:w-1/3"
              />
            </div>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <CardHeader>
                      <CardTitle className="font-headline text-xl mb-1 truncate">{event.title}</CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Created: {new Date(event.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">
                        Status: {event.registrationOpen ? "Registration Open" : "Registration Closed"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Date: {event.eventDate && event.eventTime ? `${new Date(event.eventDate + 'T' + event.eventTime).toLocaleDateString()} at ${new Date(event.eventDate + 'T' + event.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not set'}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link href={`/events/${event.id}/scan`}>
                          <QrCode className="mr-2 h-5 w-5" />
                          Scan Tickets
                          <ArrowRight className="ml-auto h-5 w-5" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
               <Card className="shadow-md">
                <CardContent className="py-12 flex flex-col items-center text-center">
                  <Search className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
                  <h2 className="text-2xl font-semibold mb-2">No Events Found</h2>
                  <p className="text-muted-foreground mb-6">
                    Your search for "{searchQuery}" did not match any events.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    // </AuthGuard> // Removed page-level AuthGuard
  );
}
