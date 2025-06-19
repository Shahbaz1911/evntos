
"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEvents } from '@/context/EventContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import LoadingSpinner from './loading-spinner';
import { QRCodeSVG } from 'qrcode.react';
import type { Registration } from '@/types';

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address.").max(100),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  eventId: string;
  eventName: string;
}

export default function RegistrationForm({ eventId, eventName }: RegistrationFormProps) {
  const { addRegistration } = useEvents();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRegistration, setSubmittedRegistration] = useState<Registration | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const newRegistration = await addRegistration({ eventId, ...data }); 
      if (newRegistration) {
        toast({
          title: "Registration Successful!",
          description: `You're registered for "${eventName}". Your QR code ticket is below.`,
        });
        setSubmittedRegistration(newRegistration);
        reset();
      } else {
        throw new Error("Failed to get registration details after creation.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "Could not complete registration. Please try again.",
        variant: "destructive",
      });
      setSubmittedRegistration(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedRegistration) {
    return (
      <Card className="bg-green-50 border-green-200 shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-green-700 font-headline text-2xl">Registration Confirmed!</CardTitle>
          <CardDescription className="text-green-600">
            Thank you for registering for {eventName}.<br/> Present this QR code at the event.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-inner">
            <QRCodeSVG value={submittedRegistration.id} size={192} includeMargin={true} />
          </div>
          <p className="text-sm text-muted-foreground">Name: {submittedRegistration.name}</p>
          <p className="text-sm text-muted-foreground">Email: {submittedRegistration.email}</p>
          <Button variant="outline" onClick={() => { setSubmittedRegistration(null); reset(); }} className="mt-4">
            Register another person
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-primary">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">Register for {eventName}</CardTitle>
        <CardDescription>Fill in your details below to secure your spot.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} placeholder="John Doe" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting && <LoadingSpinner size={16} className="mr-2" />}
            {isSubmitting ? "Registering..." : "Register Now & Get QR Ticket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
