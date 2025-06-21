
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/loading-spinner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
// import AuthGuard from '@/components/auth-guard'; // Removed page-level AuthGuard

const createEventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long." }).max(100, { message: "Title cannot exceed 100 characters." }),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const { addEvent, isGeneratingSlug } = useEvents();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
  });

  const onSubmit: SubmitHandler<CreateEventFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const newEvent = await addEvent({ title: data.title });
      if (newEvent) {
        toast({
          title: "Event Created!",
          description: `"${newEvent.title}" has been successfully created.`,
          variant: "success",
        });
        router.push(`/events/${newEvent.id}/edit`);
      } else {
        throw new Error("Failed to create event.");
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        title: "Error",
        description: "Could not create event. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    // <AuthGuard> Removed page-level AuthGuard
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Create New Event</CardTitle>
            <CardDescription>Start by giving your event a catchy title. You can add more details later.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Event Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Summer Music Festival"
                  {...register("title")}
                  className={errors.title ? "border-destructive" : ""}
                  aria-invalid={errors.title ? "true" : "false"}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting || isGeneratingSlug}>
                {(isSubmitting || isGeneratingSlug) && <LoadingSpinner size={16} className="mr-2" />}
                {isGeneratingSlug ? "Generating SEO URL..." : (isSubmitting ? "Creating Event..." : "Create Event & Continue")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    // </AuthGuard> Removed page-level AuthGuard
  );
}
