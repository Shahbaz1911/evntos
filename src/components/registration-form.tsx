
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
import { useState, useRef } from 'react';
import LoadingSpinner from './loading-spinner';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import type { Registration } from '@/types';
import { Download, Phone } from 'lucide-react';

const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address.").max(100),
  contactNumber: z.string()
    .min(5, "Contact number seems too short.")
    .max(20, "Contact number seems too long.")
    .regex(/^[+\d()-\s]*$/, "Invalid characters in contact number. Use numbers, spaces, -, (, ).")
    .optional()
    .or(z.literal('')),
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
  
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const newRegistration = await addRegistration({ 
        eventId, 
        name: data.name,
        email: data.email,
        contactNumber: data.contactNumber || undefined,
      }); 
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

  const handleDownloadTicket = () => {
    if (!submittedRegistration) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 2; // For higher resolution image
    const padding = 20 * scale;
    const qrSize = 128 * scale;
    const lineHeight = 20 * scale;
    const textMarginTop = 10 * scale;
    
    const eventNameText = `Event: ${eventName}`;
    const guestNameText = `Guest: ${submittedRegistration.name}`;
    const emailText = `Email: ${submittedRegistration.email}`;
    const contactText = submittedRegistration.contactNumber ? `Contact: ${submittedRegistration.contactNumber}` : "";

    ctx.font = `${16 * scale}px Inter, sans-serif`;
    const eventNameWidth = ctx.measureText(eventNameText).width;
    const guestNameWidth = ctx.measureText(guestNameText).width;
    const emailWidth = ctx.measureText(emailText).width;
    const contactWidth = contactText ? ctx.measureText(contactText).width : 0;
    
    const textBlockHeight = lineHeight * (contactText ? 4 : 3) + (textMarginTop * (contactText ? 3 : 2));
    const contentWidth = Math.max(qrSize, eventNameWidth, guestNameWidth, emailWidth, contactWidth);
    
    canvas.width = contentWidth + padding * 2;
    canvas.height = qrSize + padding * 2 + textBlockHeight + padding; // Extra padding at bottom

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Event Name
    ctx.fillStyle = '#4285F4'; // Primary color
    ctx.font = `bold ${18*scale}px Inter, sans-serif`;
    ctx.fillText(eventNameText, padding, padding + lineHeight);

    // Draw Guest Name
    ctx.fillStyle = 'black';
    ctx.font = `${16*scale}px Inter, sans-serif`;
    ctx.fillText(guestNameText, padding, padding + lineHeight * 2 + textMarginTop);
    
    // Draw Email
    ctx.fillText(emailText, padding, padding + lineHeight * 3 + textMarginTop * 2);

    // Draw Contact Number if available
    let qrTopPosition = padding + lineHeight * 3 + textMarginTop * 2 + lineHeight;
    if (contactText) {
      ctx.fillText(contactText, padding, padding + lineHeight * 4 + textMarginTop * 3);
      qrTopPosition = padding + lineHeight * 4 + textMarginTop * 3 + lineHeight;
    }


    // Draw QR Code
    // Create a temporary canvas for QRCodeCanvas to render onto
    const tempQrCanvas = document.createElement('canvas');
    const qrComponent = <QRCodeCanvas value={submittedRegistration.id} size={qrSize} level="H" includeMargin={false} />;
    
    // This is a bit of a hack to get QRCodeCanvas to render to our temp canvas.
    // We'll render it to a React Portal targeting the temp canvas.
    // However, a more direct way if QRCodeCanvas exposes its canvas or data directly would be better.
    // For now, let's use an Image approach as it's more reliable.

    const qrImage = new Image();
    const qrSvgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="${qrSize}" height="${qrSize}">${
        new QRCodeSVG({value: submittedRegistration.id, size: 256, level:"H", includeMargin: false, }).props.children
    }</svg>`;

    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvas.width - qrSize) / 2, qrTopPosition, qrSize, qrSize);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${eventName.replace(/\s+/g, '_')}-Ticket-${submittedRegistration.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    qrImage.onerror = (err) => {
        console.error("Error loading QR SVG for canvas drawing:", err);
        toast({ title: "Download Error", description: "Could not generate QR code image.", variant: "destructive" });
    }
    qrImage.src = `data:image/svg+xml;base64,${btoa(qrSvgString)}`;
  };


  if (submittedRegistration) {
    return (
      <Card className="bg-green-50 border-green-200 shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-green-700 font-headline text-2xl">Registration Confirmed!</CardTitle>
          <CardDescription className="text-green-600">
            Thank you for registering for {eventName}.<br/> Present this QR code at the event or download your ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-inner border border-green-300">
            <QRCodeSVG value={submittedRegistration.id} size={192} includeMargin={true} level="H" />
          </div>
          <p className="text-sm text-muted-foreground"><strong>Name:</strong> {submittedRegistration.name}</p>
          <p className="text-sm text-muted-foreground"><strong>Email:</strong> {submittedRegistration.email}</p>
          {submittedRegistration.contactNumber && (
            <p className="text-sm text-muted-foreground"><strong>Contact:</strong> {submittedRegistration.contactNumber}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
            <Button variant="default" onClick={handleDownloadTicket} className="w-full bg-accent hover:bg-accent/90">
              <Download className="mr-2 h-4 w-4" /> Download Ticket
            </Button>
            <Button variant="outline" onClick={() => { setSubmittedRegistration(null); reset(); }} className="w-full">
              Register another person
            </Button>
          </div>
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
          <div className="space-y-1">
            <Label htmlFor="contactNumber" className="flex items-center">
              <Phone className="mr-2 h-4 w-4 text-muted-foreground" /> Contact Number (Optional)
            </Label>
            <Input id="contactNumber" type="tel" {...register("contactNumber")} placeholder="+1 123 456 7890" />
            {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber.message}</p>}
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

