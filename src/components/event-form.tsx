
"use client";

import type { Event } from '@/types';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import Image from 'next/image';
import { CalendarDays, Clock, MapPin, UploadCloud } from 'lucide-react';
import React, { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters.").max(100, "Title cannot exceed 100 characters."),
  description: z.string().max(5000, "Description cannot exceed 5000 characters.").optional(),
  imageUrl: z.string().url("Must be a valid URL or local file placeholder.").or(z.string().startsWith("local-file://")).optional().or(z.literal('')),
  venueName: z.string().max(200, "Venue name cannot exceed 200 characters.").optional().or(z.literal('')),
  venueAddress: z.string().max(300, "Venue address cannot exceed 300 characters.").optional().or(z.literal('')),
  mapLink: z.string().url("Must be a valid Google Maps URL.").optional().or(z.literal('')),
  eventDate: z.string().min(1, "Event date is required.").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD."),
  eventTime: z.string().min(1, "Event time is required.").regex(/^\d{2}:\d{2}$/, "Invalid time format. Use HH:MM."),
  registrationOpen: z.boolean(),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event: Event;
  onSubmit: (data: EventFormValues) => Promise<void>;
  isSubmitting: boolean;
  isGeneratingSlug: boolean;
}

export default function EventForm({ event, onSubmit, isSubmitting, isGeneratingSlug }: EventFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event.title,
      description: event.description || '',
      imageUrl: event.imageUrl || '',
      venueName: event.venueName || '',
      venueAddress: event.venueAddress || '',
      mapLink: event.mapLink || '',
      eventDate: event.eventDate || '',
      eventTime: event.eventTime || '',
      registrationOpen: event.registrationOpen,
    },
  });

  const currentImageUrl = watch("imageUrl");

  const handleFormSubmit: SubmitHandler<EventFormValues> = async (data) => {
    // If imageUrl still starts with local-file://, remind user it's not a real upload.
    if (data.imageUrl?.startsWith("local-file://")) {
        toast({
            title: "Using Placeholder Image URL",
            description: "The selected local image is a placeholder. For a live event, ensure you upload the image to a hosting service and use that URL.",
            variant: "default", // Use default or a custom 'warning' if available
        });
    }
    await onSubmit(data);
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("imageUrl", `local-file://${file.name}`, { shouldValidate: true });
      toast({
        title: "Local Image Selected",
        description: `${file.name} selected. This is a local preview only. Upload to a hosting service for a live URL.`,
      });
       // Reset file input to allow selecting the same file again if needed
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input id="title" {...register("title")} placeholder="Your Event Title" />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} placeholder="Tell us more about your event..." rows={5} />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="eventDate" className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
              Event Date
            </Label>
            <Input 
              id="eventDate" 
              type="date" 
              {...register("eventDate")} 
              className={errors.eventDate ? "border-destructive" : ""}
            />
            {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime" className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              Event Time
            </Label>
            <Input 
              id="eventTime" 
              type="time" 
              {...register("eventTime")} 
              className={errors.eventTime ? "border-destructive" : ""}
            />
            {errors.eventTime && <p className="text-sm text-destructive">{errors.eventTime.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="imageUrl" 
              {...register("imageUrl")} 
              placeholder="https://example.com/image.png or upload" 
              className="flex-grow"
            />
            <Button type="button" variant="outline" onClick={handleImageUploadClick}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
          {currentImageUrl && !currentImageUrl.startsWith("local-file://") && (
            <div className="mt-2 relative w-full h-64 rounded-md overflow-hidden border">
              <Image 
                src={currentImageUrl} 
                alt="Event preview" 
                fill 
                style={{objectFit:"cover"}} 
                data-ai-hint="event poster"
                onError={(e) => {
                  // Fallback for invalid URLs, maybe show placeholder or hide
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Optionally, set a placeholder here
                }}
              />
            </div>
          )}
           {currentImageUrl && currentImageUrl.startsWith("local-file://") && (
            <div className="mt-2 p-4 text-sm text-muted-foreground border rounded-md bg-secondary">
              Local image selected: {currentImageUrl.replace("local-file://", "")}. <br/>
              Preview is not available for local files. Please upload to a hosting service and paste the URL for a live preview.
            </div>
          )}
        </div>
        
        <div className="border-t border-border pt-6 space-y-6">
            <h3 className="text-lg font-medium text-foreground flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                Event Location
            </h3>
            <div className="space-y-2">
                <Label htmlFor="venueName">Venue Name (Optional)</Label>
                <Input id="venueName" {...register("venueName")} placeholder="e.g., The Grand Hall" />
                {errors.venueName && <p className="text-sm text-destructive">{errors.venueName.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="venueAddress">Venue Address (Optional)</Label>
                <Textarea id="venueAddress" {...register("venueAddress")} placeholder="e.g., 123 Main Street, Anytown, USA" rows={3} />
                {errors.venueAddress && <p className="text-sm text-destructive">{errors.venueAddress.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="mapLink">Google Maps Link (Optional)</Label>
                <Input id="mapLink" {...register("mapLink")} placeholder="https://maps.app.goo.gl/example" />
                {errors.mapLink && <p className="text-sm text-destructive">{errors.mapLink.message}</p>}
            </div>
        </div>


        <div className="flex items-center space-x-2 pt-6 border-t border-border">
          <Switch 
            id="registrationOpen" 
            checked={watch("registrationOpen")}
            onCheckedChange={(checked) => setValue("registrationOpen", checked)}
            aria-label="Toggle event registration"
          />
          <Label htmlFor="registrationOpen">Accept Registrations</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting || isGeneratingSlug}>
          {(isSubmitting || isGeneratingSlug) && <LoadingSpinner size={16} className="mr-2" />}
          {isGeneratingSlug ? "Updating SEO URL..." : (isSubmitting ? "Saving Changes..." : "Save Changes")}
        </Button>
      </CardFooter>
    </form>
  );
}
      
