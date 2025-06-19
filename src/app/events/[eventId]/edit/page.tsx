
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEvents } from '@/context/EventContext';
import EventForm, { type EventFormValues } from '@/components/event-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft, Users, Eye, Trash2, QrCode } from 'lucide-react';
import type { Event } from '@/types';
import AuthGuard from '@/components/auth-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { getEventById, updateEvent, deleteEvent, isGeneratingSlug, events } = useEvents();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      // Try to get event from context first (faster if already loaded)
      let foundEvent = getEventById(eventId);
      
      // If not in context (e.g., direct navigation), try to find in the full events list if available
      // This is a fallback, ideally context should be up-to-date or refetch mechanism robust
      if (!foundEvent && events.length > 0) {
        foundEvent = events.find(e => e.id === eventId) || null;
      }

      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        // If still not found after context check and full list, then show error or redirect.
        // This might indicate the event doesn't exist or there's a delay in context loading.
        // For simplicity, we assume if it's not in getEventById, it might not be loaded yet or doesn't exist.
        // A more robust solution might involve a dedicated fetch if not found.
        toast({
          title: "Notice",
          description: "Event details are loading or event not found.",
          variant: "default",
        });
        // Consider router.push('/') if event is definitively not found after loading.
      }
      setIsLoading(false); // Set loading to false once check is done
    }
  }, [eventId, getEventById, events, router, toast]);


  const handleSubmit = async (data: EventFormValues) => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      const updatedEventData: Event = {
        ...event,
        ...data,
      };
      await updateEvent(updatedEventData);
      setEvent(updatedEventData); // Optimistically update local state
      toast({
        title: "Event Updated",
        description: `"${data.title}" has been successfully updated.`,
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      toast({
        title: "Error",
        description: "Could not update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!event) return;
    deleteEvent(event.id);
    setIsDeleteDialogOpen(false);
    router.push('/');
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
          <p className="text-xl text-muted-foreground">Event not found or still loading.</p>
          <Button asChild className="mt-4">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }
  
  // Ensure event is not null before rendering form or actions
  if (!event) {
    // This case should ideally be covered by the loading/not found logic above,
    // but as a fallback:
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-64">
          <p>Loading event details...</p> <LoadingSpinner size={24} className="ml-2"/>
        </div>
      </AuthGuard>
    );
  }


  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-2xl">Edit: {event.title}</CardTitle>
                <CardDescription>Update your event details and manage settings.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                 <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/guests`}>
                    <Users className="mr-2 h-4 w-4" /> Guest List
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}/scan`}>
                    <QrCode className="mr-2 h-4 w-4" /> Scan Tickets
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/e/${event.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" /> View Public Page
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          
            <>
              <EventForm
                event={event}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isGeneratingSlug={isGeneratingSlug}
              />
              <CardFooter className="border-t pt-6 mt-6 flex justify-end">
                 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the event "{event.title}" and all its registrations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardFooter>
            </>
          
        </Card>
      </div>
    </AuthGuard>
  );
}
