"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import RegistrationForm from '@/components/registration-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { Calendar, MapPin, Ticket, XCircle, ExternalLink } from 'lucide-react';
import type { Event } from '@/types';

export default function PublicEventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { getEventBySlug } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const foundEvent = getEventBySlug(slug);
      if (foundEvent) {
        setEvent(foundEvent);
      }
      // No explicit "not found" toast here to avoid issues with initial load / slug generation delay
      // It will just show the "Event not found" message if event remains null after loading
      setIsLoading(false); 
    }
  }, [slug, getEventBySlug]);


  if (isLoading) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-xl">
        <div className="relative w-full h-72 md:h-96">
          <Image 
            src={event.imageUrl || "https://placehold.co/1200x600.png"} 
            alt={event.title} 
            layout="fill" 
            objectFit="cover"
            priority
            data-ai-hint="event banner"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
           <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <h1 className="text-3xl md:text-5xl font-bold font-headline text-white drop-shadow-lg">{event.title}</h1>
           </div>
        </div>
        
        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
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
                 {/* Basic map embed, may require more robust solution for production */}
                <div className="mt-4 aspect-video rounded-md overflow-hidden border">
                  <iframe
                    width="100%"
                    height="100%"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(event.mapLink.includes('goo.gl') ? event.title : event.mapLink)}`}
                    title="Event Location"
                    data-ai-hint="map location"
                    >
                  </iframe>
                   <p className="text-xs text-muted-foreground mt-1">Note: Map preview is indicative. Please use the "View on Google Maps" link for accurate directions. Replace YOUR_API_KEY with an actual Google Maps API key for full functionality.</p>
                </div>
              </div>
            )}

            <div className="flex items-center text-muted-foreground">
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
