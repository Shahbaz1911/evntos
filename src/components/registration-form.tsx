
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
import { QRCodeSVG } from 'qrcode.react';
import type { Registration } from '@/types';
import { Download, Phone } from 'lucide-react';
import jsPDF from 'jspdf';

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
    if (!ctx) {
      toast({ title: "Download Error", description: "Could not initialize graphics for ticket.", variant: "destructive" });
      return;
    }

    // PDF page/ticket dimensions in mm
    const pdfTicketWidthMm = 70;
    const pdfTicketHeightMm = 120; // Adjusted for a common ticket aspect ratio

    // DPI for rendering on canvas
    const dpi = 300;
    const mmToPx = (mm: number) => (mm / 25.4) * dpi;

    canvas.width = Math.round(mmToPx(pdfTicketWidthMm));
    canvas.height = Math.round(mmToPx(pdfTicketHeightMm));
    
    // Styling
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const primaryHsl = primaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/) 
      ? `hsl(${primaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[1]}, ${primaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[2]}%, ${primaryColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[3]}%)`
      : '#4285F4'; // Fallback primary color

    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim();
     const textHsl = textColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
      ? `hsl(${textColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[1]}, ${textColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[2]}%, ${textColor.match(/(\d+)\s+(\d+)%\s+(\d+)%/)?.[3]}%)`
      : '#333333'; // Fallback text color


    // Background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Content
    const padding = mmToPx(6);
    let currentY = padding;

    // Event Name (Larger, Bold)
    ctx.fillStyle = primaryHsl;
    ctx.font = `bold ${mmToPx(6)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(eventName, canvas.width / 2, currentY + mmToPx(6));
    currentY += mmToPx(12);

    // Guest Name
    ctx.fillStyle = textHsl;
    ctx.font = `normal ${mmToPx(4.5)}px Inter, sans-serif`;
    ctx.fillText(`Guest: ${submittedRegistration.name}`, canvas.width / 2, currentY + mmToPx(4.5));
    currentY += mmToPx(8);

    // Email
    ctx.fillText(`Email: ${submittedRegistration.email}`, canvas.width / 2, currentY + mmToPx(4.5));
    currentY += mmToPx(8);
    
    // Contact Number (if available)
    if (submittedRegistration.contactNumber) {
      ctx.fillText(`Contact: ${submittedRegistration.contactNumber}`, canvas.width / 2, currentY + mmToPx(4.5));
      currentY += mmToPx(8);
    }
    
    currentY += mmToPx(4); // Some space before QR

    // QR Code
    const qrSizePx = mmToPx(45); // 45mm QR code
    const qrSvgString = new QRCodeSVG({ value: submittedRegistration.id, size: 256, level: "H", includeMargin: false }).props.children as string;
    
    // Create an image from SVG string to draw on canvas
    const qrImage = new Image();
    qrImage.onload = () => {
      // Draw QR code centered
      ctx.drawImage(qrImage, (canvas.width - qrSizePx) / 2, currentY, qrSizePx, qrSizePx);
      currentY += qrSizePx + mmToPx(5);

      // "Present this at the event"
      ctx.fillStyle = textHsl;
      ctx.font = `italic ${mmToPx(3.5)}px Inter, sans-serif`;
      ctx.fillText("Present this QR code at the event.", canvas.width / 2, currentY + mmToPx(3.5));

      // Convert canvas to image data
      const dataUrl = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfTicketWidthMm, pdfTicketHeightMm]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfTicketWidthMm, pdfTicketHeightMm);
      
      const fileName = `${eventName.replace(/\s+/g, '_')}-Ticket-${submittedRegistration.name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    };
    qrImage.onerror = (err) => {
        console.error("Error loading QR SVG for canvas drawing:", err);
        toast({ title: "Download Error", description: "Could not generate QR code image for PDF.", variant: "destructive" });
    }
    // Convert SVG string to base64 data URL
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
              <Download className="mr-2 h-4 w-4" /> Download Ticket (PDF)
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
