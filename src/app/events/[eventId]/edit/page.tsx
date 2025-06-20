
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
import { ArrowLeft, Eye, Trash2, Share2 } from 'lucide-react';
import type { Event } from '@/types';
import AuthGuard from '@/components/auth-guard';
import { useAuth } from '@/context/AuthContext';
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
  const { getEventById, updateEvent, deleteEvent, isGeneratingSlug, events, contextLoading: eventContextLoading } = useEvents();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            description: "You are not authorized to edit this event.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }
        setEvent(foundEvent);
      } else {
         if (events.length > 0 || !eventContextLoading) {
            toast({
              title: "Event Not Found",
              description: "The event you are trying to edit does not exist.",
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
  }, [eventId, getEventById, events, authUser, authLoading, eventContextLoading, router, toast]);


  const handleSubmit = async (data: EventFormValues) => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      const updatedEventData: Event = {
        ...event,
        ...data,
      };
      await updateEvent(updatedEventData);
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
    toast({
        title: "Event Deleted",
        description: `"${event.title}" has been successfully deleted.`,
      });
    router.push('/');
  };

  const handleShare = async () => {
    if (!event || !event.slug) return;
    const shareUrl = `${window.location.origin}/e/${event.slug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Public event link copied to clipboard.",
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


  if (isLoading || authLoading || eventContextLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!event) { 
     return (
      <AuthGuard> 
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">Event not found or you do not have permission to access it.</p>
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
                <CardTitle className="font-headline text-2xl">Edit: {event.title}</CardTitle>
                <CardDescription>Update your event details and manage settings.</CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" /> Share Link
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
