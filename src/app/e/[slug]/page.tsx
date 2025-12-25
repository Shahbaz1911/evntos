
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
import { Calendar, MapPin, Ticket, XCircle, ExternalLink, Share2, Info, Building, Map } from 'lucide-react';
import type { Event } from '@/types';
import { useToast } from '@/hooks/use-toast';


const formatEventDateTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || dateStr.trim() === "" || !timeStr || timeStr.trim() === "") {
    return "Date and time not specified.";
  }
  const dateTime = new Date(`${dateStr.trim()}T${timeStr.trim()}:00`); 

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
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Event share link copied to clipboard.",
        });
      }
    } catch (err) {
      console.error('Failed to copy or share: ', err);
      toast({
        title: "Error",
        description: "Could not copy or share link. Please try again.",
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
          const storageKey = `evntos_shared_visit_${foundEvent.id}`;
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
      <div className="text-center py-20 container px-4">
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
  const hasLocationInfo = event.venueName || event.venueAddress || event.mapLink;
  const mapQuery = event.venueAddress || event.venueName || event.title;


  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 container px-4 py-6 sm:py-8">
      <Card className="overflow-hidden shadow-xl rounded-lg border-border">
        <div className="relative w-full h-60 sm:h-72 md:h-96">
          <Image 
            src={event.imageUrl || "https://placehold.co/1200x600.png"} 
            alt={event.title} 
            fill 
            style={{objectFit: "cover"}} 
            priority
            data-ai-hint="event banner"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
           <div className="absolute top-4 right-4 z-10">
              <Button variant="outline" size="sm" onClick={handleShare} className="bg-background/80 hover:bg-background text-foreground backdrop-blur-sm">
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
           <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-white drop-shadow-lg">{event.title}</h1>
           </div>
        </div>
        
        <CardContent className="p-4 sm:p-6 md:p-8 grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h2 className="text-xl sm:text-2xl font-semibold font-headline text-primary mb-3 flex items-center">
                <Calendar className="mr-3 h-5 w-5 sm:h-6 sm:w-6" /> Date & Time
              </h2>
              <p className="text-foreground/90 text-base sm:text-lg">
                {formatEventDateTime(event.eventDate, event.eventTime)}
              </p>
            </div>
            
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold font-headline text-primary mb-3">About this Event</h2>
              <p className="text-foreground/90 whitespace-pre-line leading-relaxed text-base">
                {event.description || "No description provided."}
              </p>
            </div>

            {hasLocationInfo && (
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold font-headline text-primary mb-3 flex items-center">
                  <MapPin className="mr-3 h-5 w-5 sm:h-6 sm:w-6" /> Location
                </h2>
                {event.venueName && (
                  <p className="text-lg font-medium text-foreground flex items-center mb-1">
                     <Building className="mr-2 h-5 w-5 text-muted-foreground" /> {event.venueName}
                  </p>
                )}
                {event.venueAddress && (
                  <p className="text-md text-foreground/80 whitespace-pre-line mb-3">{event.venueAddress}</p>
                )}
                
                {event.mapLink && (
                    <Button variant="outline" asChild className="mt-2">
                      <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline">
                         <Map className="mr-2 h-4 w-4" /> View on Google Maps <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                )}
                
                {(event.venueAddress || event.venueName) && (
                  <div className="mt-4">
                    <div className="aspect-video rounded-lg overflow-hidden border">
                      <iframe
                        width="100%"
                        height="100%"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(mapQuery)}`}
                        title="Event Location"
                        data-ai-hint="map location"
                        >
                      </iframe>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: Map preview is indicative. For precise directions, use the "View on Google Maps" link if available. 
                        {googleMapsApiKey === "YOUR_API_KEY" && " (Map functionality limited without a valid API key)."}
                    </p>
                  </div>
                )}
              </div>
            )}


            <div className="flex items-center text-muted-foreground text-sm pt-4 border-t border-border">
              <Info className="mr-2 h-5 w-5" />
              <span>Event created on: {new Date(event.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="lg:col-span-1">
            {event.registrationOpen ? (
              <RegistrationForm eventId={event.id} eventName={event.title} />
            ) : (
              <div className="sticky top-24">
                <Card className="bg-secondary border-primary/20 shadow-none border-2 border-dashed p-6 text-center rounded-lg flex flex-col items-center justify-center h-full">
                  <Ticket className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-4" />
                  <CardTitle className="font-headline text-xl sm:text-2xl text-primary mb-2">Registration Closed</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    We're sorry, but registrations for this event are currently closed. Please check back later or contact the event organizer for more information.
                  </CardDescription>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    