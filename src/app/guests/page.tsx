
"use client";

import { useMemo, useState } from 'react';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import GuestListItem from '@/components/guest-list-item';
import { Users, CalendarX2, FileDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Event, Registration } from '@/types';
import { Input } from '@/components/ui/input';

export default function GuestsPage() {
  const { events, getRegistrationsByEventId, contextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [guestSearchQueries, setGuestSearchQueries] = useState<{ [key: string]: string }>({});

  const isLoading = contextLoading || authLoading;

  const userEventsWithGuests = useMemo(() => {
    if (!authUser || !events) return [];
    
    return events
      .filter(event => event.userId === authUser.uid)
      .map(event => ({
        ...event,
        guests: getRegistrationsByEventId(event.id),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [events, authUser, getRegistrationsByEventId]);

  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery) return userEventsWithGuests;
    return userEventsWithGuests.filter(event =>
      event.title.toLowerCase().includes(eventSearchQuery.toLowerCase())
    );
  }, [userEventsWithGuests, eventSearchQuery]);
  
  const downloadGuestListCSV = (event: Event, registrations: Registration[]) => {
    if (registrations.length === 0) return;

    const headers = ["Name", "Email", "Contact Number", "Registered At"];
    const rows = registrations.map(reg => [
      `"${reg.name.replace(/"/g, '""')}"`,
      `"${reg.email.replace(/"/g, '""')}"`,
      `"${reg.contactNumber ? reg.contactNumber.replace(/"/g, '""') : ''}"`,
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

  return (
    <div className="space-y-8 container mx-auto px-4 py-8">
      <Card className="shadow-md border border-border">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline text-primary flex items-center">
            <Users className="mr-3 h-8 w-8" />
            Guest Management
          </CardTitle>
          <CardDescription>View and manage registered guests for all your events.</CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size={64} />
        </div>
      ) : userEventsWithGuests.length === 0 ? (
        <Card className="shadow-md border border-border">
          <CardContent className="py-12 flex flex-col items-center text-center">
            <CalendarX2 className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't created any events with guests yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for an event by title..."
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
            />
          </div>
          {filteredEvents.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {filteredEvents.map((event) => {
                    const guestQuery = guestSearchQueries[event.id] || '';
                    const filteredGuests = event.guests.filter(guest =>
                      guest.name.toLowerCase().includes(guestQuery.toLowerCase()) ||
                      guest.email.toLowerCase().includes(guestQuery.toLowerCase())
                    );

                    return (
                      <AccordionItem value={event.id} key={event.id} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline">
                          <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                              <h3 className="font-headline text-lg text-foreground">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.guests.length} Guest(s)</p>
                            </div>
                            {event.guests.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); downloadGuestListCSV(event, event.guests); }}
                                className="mr-4"
                              >
                                <FileDown className="mr-2 h-4 w-4" />
                                Export CSV
                              </Button>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-background/50 px-6 py-4">
                          {event.guests.length > 0 ? (
                            <>
                              <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="search"
                                  placeholder="Search guests by name or email..."
                                  value={guestQuery}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setGuestSearchQueries(prev => ({ ...prev, [event.id]: e.target.value }));
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="pl-10"
                                />
                              </div>
                              {filteredGuests.length > 0 ? (
                                <div className="space-y-4">
                                  {filteredGuests.map((guest) => (
                                    <GuestListItem key={guest.id} registration={guest} />
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <p className="text-muted-foreground">No guests found matching your search.</p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-muted-foreground">No guests have registered for this event yet.</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border border-border">
              <CardContent className="py-12 flex flex-col items-center text-center">
                <Search className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-semibold mb-2">No Events Found</h2>
                <p className="text-muted-foreground">
                  No events matched your search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
