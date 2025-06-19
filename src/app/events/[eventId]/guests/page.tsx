
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import GuestListItem from '@/components/guest-list-item';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, Users, FileText } from 'lucide-react';
import type { Event, Registration } from '@/types';
import AuthGuard from '@/components/auth-guard'; 

export default function GuestListPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getRegistrationsByEventId } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setRegistrations(getRegistrationsByEventId(eventId));
      } else {
        
      }
      setIsLoading(false);
    }
  }, [eventId, getEventById, getRegistrationsByEventId, router]);

  const downloadGuestListCSV = () => {
    if (!event || registrations.length === 0) return;

    const headers = ["Name", "Email", "Registered At"];
    const rows = registrations.map(reg => [
      `"${reg.name.replace(/"/g, '""')}"`,
      `"${reg.email.replace(/"/g, '""')}"`,
      new Date(reg.registeredAt).toLocaleString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.slug}-guest-list.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  
  if (!event && !isLoading) {
    return (
      <AuthGuard>
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event not found.</p>
           <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
        </div>
      </AuthGuard>
    );
  }


  return (
    <AuthGuard> 
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${eventId}/edit`}> 
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event Edit
            </Link>
          </Button>
          {registrations.length > 0 && (
            <Button onClick={downloadGuestListCSV} variant="secondary" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Guest List for: {event?.title}</CardTitle>
            <CardDescription>
              {registrations.length} guest(s) registered for this event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No guests have registered yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => (
                  <GuestListItem key={reg.id} registration={reg} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
