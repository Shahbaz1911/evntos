
import type { Event } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Eye, Users, Trash2, Share2 } from 'lucide-react';
import Image from 'next/image';
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
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteEvent(event.id);
    setIsDeleteDialogOpen(false);
  };

  const handleShare = async () => {
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

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image 
            src={event.imageUrl || "https://placehold.co/600x400.png"} 
            alt={event.title} 
            fill 
            style={{objectFit:"cover"}} 
            data-ai-hint="event cover"
           />
        </div>
        <div className="p-6">
          <CardTitle className="font-headline text-xl mb-2 truncate">{event.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Created: {new Date(event.createdAt).toLocaleDateString()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-3 bg-muted/50 p-4 mt-auto">
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${event.id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
           <Button variant="ghost" size="sm" asChild>
            <Link href={`/events/${event.id}/guests`}>
              <Users className="mr-2 h-4 w-4" /> Guests
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
           <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
            <Link href={`/e/${event.slug}`} target="_blank" rel="noopener noreferrer">
              View Page <Eye className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
      
