
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/event-card';
import { useEvents } from '@/context/EventContext';
import { PlusCircle, CalendarX2 } from 'lucide-react';
// import AuthGuard from '@/components/auth-guard'; // Removed page-level AuthGuard
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import type { Event } from '@/types';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { events, contextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();

  const userEvents = useMemo(() => {
    if (!authUser || !events) return [];
    return events.filter(event => event.userId === authUser.uid);
  }, [events, authUser]);

  const isLoading = contextLoading || authLoading;

  return (
    // <AuthGuard>  Removed page-level AuthGuard
      <div className="space-y-8 container mx-auto px-4 py-8">
        <Card className="shadow-md border border-border">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold font-headline text-primary">Evntos Dashboard</CardTitle>
              <CardDescription>Manage your events or create a new one.</CardDescription>
            </div>
            <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/events/create">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New Event
              </Link>
            </Button>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size={64} />
          </div>
        ) : userEvents.length === 0 ? (
          <Card className="shadow-md border border-border">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <CalendarX2 className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-2">No Events Yet!</h2>
              <p className="text-muted-foreground mb-6">
                It looks like you haven't created any events. <br />
                Get started by creating your first event to engage your audience.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    // </AuthGuard> Removed page-level AuthGuard
  );
}
