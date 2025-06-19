
import type { Event } from '@/types';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Eye, Users } from 'lucide-react';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/events/${event.id}/edit`}>
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Link>
        </Button>
        <div className="flex gap-2">
         <Button variant="ghost" size="sm" asChild>
            <Link href={`/events/${event.id}/guests`}>
              <Users className="mr-2 h-4 w-4" /> Guests
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild className="bg-primary hover:bg-primary/90">
            <Link href={`/e/${event.slug}`}>
              View Page <Eye className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
      