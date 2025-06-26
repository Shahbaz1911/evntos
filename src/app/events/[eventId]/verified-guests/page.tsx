
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import VerifiedGuestListItem from '@/components/verified-guest-list-item';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, UserCheck, FileText, Users, Search } from 'lucide-react';
import type { Event, Registration } from '@/types';
// import AuthGuard from '@/components/auth-guard'; // Removed page-level AuthGuard
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export default function VerifiedGuestListPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, getRegistrationsByEventId, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [verifiedRegistrations, setVerifiedRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading || eventContextLoading) {
      setIsLoading(true);
      return;
    }

    if (eventId && authUser) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        if (foundEvent.userId !== authUser.uid) {
          toast({
            title: "Access Denied",
            description: "You are not authorized to view verified guests for this event.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }
        setEvent(foundEvent);
        const allRegistrations = getRegistrationsByEventId(eventId);
        setVerifiedRegistrations(allRegistrations.filter(reg => reg.checkedIn)); // No need to filter by source here
      } else {
         if (!eventContextLoading) {
            toast({
              title: "Event Not Found",
              description: "The event for which you are trying to view verified guests does not exist.",
              variant: "destructive",
            });
            router.push('/');
            return;
         }
      }
    } else if (!authUser && !authLoading) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [eventId, getEventById, getRegistrationsByEventId, authUser, authLoading, eventContextLoading, router, toast]);
  
  const filteredRegistrations = useMemo(() => {
    if (!searchQuery) return verifiedRegistrations;
    return verifiedRegistrations.filter(
      (reg) =>
        reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [verifiedRegistrations, searchQuery]);


  const downloadVerifiedGuestListCSV = () => {
    if (!event || verifiedRegistrations.length === 0) return;

    const headers = ["Name", "Email", "Contact Number", "Registered At", "Checked In At"];
    const rows = verifiedRegistrations.map(reg => [
      `"${reg.name.replace(/"/g, '""')}"`,
      `"${reg.email.replace(/"/g, '""')}"`,
      `"${reg.contactNumber ? reg.contactNumber.replace(/"/g, '""') : ''}"`,
      new Date(reg.registeredAt).toLocaleString(),
      reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.slug}-verified-guest-list.csv`);
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || authLoading || eventContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height,0px)-var(--footer-height,0px))]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  if (!event) {
    return (
      // <AuthGuard> // Removed page-level AuthGuard
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event not found or you do not have permission to access its verified guest list.</p>
           <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
        </div>
      // </AuthGuard> // Removed page-level AuthGuard
    );
  }

  return (
    // <AuthGuard> // Removed page-level AuthGuard
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${eventId}/edit`}> 
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event Edit
            </Link>
          </Button>
          {verifiedRegistrations.length > 0 && (
            <Button onClick={downloadVerifiedGuestListCSV} variant="secondary" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center">
              <UserCheck className="mr-3 h-8 w-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">Verified Guests for: {event?.title}</CardTitle>
                <CardDescription>
                  {verifiedRegistrations.length} guest(s) checked in for this event.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">{searchQuery ? "No verified guests found matching your search." : "No guests have been checked in yet."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegistrations.map((reg) => (
                  <VerifiedGuestListItem key={reg.id} registration={reg} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    // </AuthGuard> // Removed page-level AuthGuard
  );
}
