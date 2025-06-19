
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
import { ArrowLeft, Eye, Users, Share2, Trash2 } from 'lucide-react';
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
  const { getEventById, updateEvent, deleteEvent, isGeneratingSlug } = useEvents();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        toast({
          title: "Error",
          description: "Event not found.",
          variant: "destructive",
        });
        router.push('/');
      }
      setIsLoading(false);
    }
  }, [eventId, getEventById, router, toast]);

  const handleSubmit = async (data: EventFormValues) => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      const updatedEventData: Event = {
        ...event,
        ...data,
      };
      await updateEvent(updatedEventData);
      setEvent(updatedEventData); 
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

  const handleShare = async () => {
    if (!event) return;
    const shareUrl = `${window.location.origin}/e/${event.slug}`;
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
          <Button asChild className="mt-4">
            <Link href="/">Go to Dashboard</Link>
          </Button>
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
                <CardTitle className="font-headline text-2xl">Edit: {event?.title}</CardTitle>
                <CardDescription>Update your event details and manage settings.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                 <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event?.id}/guests`}>
                    <Users className="mr-2 h-4 w-4" /> Guest List
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <Link href={`/e/${event?.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" /> View Public Page
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          {event && ( 
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
                          This action cannot be undone. This will permanently delete the event "{event?.title}" and all its registrations.
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
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}
