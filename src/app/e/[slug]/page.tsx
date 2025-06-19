
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation'; 
import Image from 'next/image';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import RegistrationForm from '@/components/registration-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { Calendar, MapPin, Ticket, XCircle, ExternalLink, Clock, Share2 } from 'lucide-react';
import type { Event } from '@/types';
import { useToast } from '@/hooks/use-toast';


const formatEventDateTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || dateStr.trim() === "" || !timeStr || timeStr.trim() === "") {
    return "Date and time not specified.";
  }
  const dateTime = new Date(`${dateStr}T${timeStr}:00`); 

  if (isNaN(dateTime.getTime())) {
    return "Invalid date or time format provided.";
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  return `${dateTime.toLocaleDateString(undefined, dateOptions)} at ${dateTime.toLocaleTimeString(undefined, timeOptions)}`;
};


export default function PublicEventPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { getEventBySlug, recordSharedLinkVisit, contextLoading: eventsContextLoading, events } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();

  const handleShare = useCallback(async () => {
    if (!event) return;
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Event share link copied to clipboard.",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({
        title: "Error",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      });
    }
  }, [event, toast]);
  

  useEffect(() => {
    if (!eventsContextLoading && slug) {
      const foundEvent = getEventBySlug(slug);
      if (foundEvent) {
        setEvent(foundEvent);
        
        if (typeof window !== 'undefined' && recordSharedLinkVisit) {
          const storageKey = `eventwave_shared_visit_${foundEvent.id}`;
          if (!localStorage.getItem(storageKey)) {
            recordSharedLinkVisit(foundEvent.id, foundEvent.slug)
              .then(() => localStorage.setItem(storageKey, 'true'))
              .catch(err => console.error("Failed to record shared link visit", err));
          }
        }
      }
      setPageLoading(false); 
    } else if (eventsContextLoading) {
      setPageLoading(true);
    }
  }, [slug, getEventBySlug, recordSharedLinkVisit, eventsContextLoading, events]);


  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <XCircle className="mx-auto h-20 w-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold font-headline text-destructive mb-4">Event Not Found</h1>
        <p className="text-lg text-muted-foreground mb-6">The event you're looking for doesn't exist or may have been moved.</p>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY";


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full h-72 md:h-96">
          <Image 
            src={event.imageUrl || "https://placehold.co/1200x600.png"} 
            alt={event.title} 
            fill 
            style={{objectFit: "cover"}} 
            priority
            data-ai-hint="event banner"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
           <div className="absolute top-4 right-4 z-10">
              <Button variant="outline" size="sm" onClick={handleShare} className="bg-background/80 hover:bg-background">
                <Share2 className="mr-2 h-4 w-4" /> Share Event
              </Button>
            </div>
           <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-bold font-headline text-white drop-shadow-lg">{event.title}</h1>
           </div>
        </div>
        
        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold font-headline text-primary mb-2 flex items-center">
                <Calendar className="mr-2 h-6 w-6" /> Date & Time
              </h2>
              <p className="text-foreground/80 text-lg">
                {formatEventDateTime(event.eventDate, event.eventTime)}
              </p>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold font-headline text-primary mb-2">About this Event</h2>
              <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                {event.description || "No description provided."}
              </p>
            </div>

            {event.mapLink && (
              <div>
                <h2 className="text-2xl font-semibold font-headline text-primary mb-2 flex items-center">
                  <MapPin className="mr-2 h-6 w-6" /> Location
                </h2>
                <Button variant="outline" asChild>
                  <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
                    View on Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <div className="mt-4 aspect-video rounded-md overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(event.mapLink.includes('goo.gl') || event.mapLink.includes('maps.app.goo.gl') ? event.title : event.mapLink)}`}
                    title="Event Location"
                    data-ai-hint="map location"
                    >
                  </iframe>
                   <p className="text-xs text-muted-foreground mt-1">Note: Map preview is indicative. Please use the "View on Google Maps" link for accurate directions. {googleMapsApiKey === "YOUR_API_KEY" && "Replace YOUR_API_KEY with an actual Google Maps API key for full functionality."}</p>
                </div>
              </div>
            )}

            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="mr-2 h-5 w-5" />
              <span>Created on: {new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="md:col-span-1">
            {event.registrationOpen ? (
              <RegistrationForm eventId={event.id} eventName={event.title} />
            ) : (
              <Card className="bg-muted border-dashed shadow-none">
                <CardHeader>
                  <CardTitle className="font-headline text-xl flex items-center text-muted-foreground">
                    <Ticket className="mr-2 h-6 w-6" /> Registration Closed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Registrations for this event are currently closed. Please check back later or contact the organizer.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
