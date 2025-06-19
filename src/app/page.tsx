
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/event-card';
import { useEvents } from '@/context/EventContext';
import { PlusCircle, CalendarDays } from 'lucide-react';
import AuthGuard from '@/components/auth-guard'; 

export default function HomePage() {
  const { events } = useEvents();

  return (
    <AuthGuard> 
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-card rounded-lg shadow">
          <h1 className="text-3xl font-bold font-headline text-primary">Your Events</h1>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link href="/events/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Event
            </Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground font-semibold">No events yet.</p>
            <p className="text-muted-foreground">Get started by creating your first event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
