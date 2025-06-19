
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
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
import type { Registration } from '@/types';
import { Download, Phone, CheckCircle, User, Mail } from 'lucide-react'; 
import jsPDF from 'jspdf';
import { toDataURL as QRCodeToDataURL } from 'qrcode';


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
          description: `You're registered for "${eventName}". Download your PDF ticket below.`,
        });
        setSubmittedRegistration(newRegistration);
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

  const handleDownloadTicket = async () => {
    if (!submittedRegistration) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      toast({ title: "Download Error", description: "Could not initialize graphics for ticket.", variant: "destructive" });
      return;
    }

    const pdfTicketWidthMm = 70;
    const pdfTicketHeightMm = 120;
    const dpi = 300;
    const mmToPx = (mm: number) => (mm / 25.4) * dpi;

    canvas.width = Math.round(mmToPx(pdfTicketWidthMm));
    canvas.height = Math.round(mmToPx(pdfTicketHeightMm));
    
    const primaryColorStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const primaryHslMatch = primaryColorStyle.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    const primaryHsl = primaryHslMatch 
      ? `hsl(${primaryHslMatch[1]}, ${primaryHslMatch[2]}%, ${primaryHslMatch[3]}%)`
      : '#4285F4';

    const textColorStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-foreground').trim();
    const textHslMatch = textColorStyle.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    const textHsl = textHslMatch
      ? `hsl(${textHslMatch[1]}, ${textHslMatch[2]}%, ${textHslMatch[3]}%)`
      : '#333333';
    
    const mutedColorStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
    const mutedHslMatch = mutedColorStyle.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    const mutedHsl = mutedHslMatch
      ? `hsl(${mutedHslMatch[1]}, ${mutedHslMatch[2]}%, ${mutedHslMatch[3]}%)`
      : '#71717A';


    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card').trim() || 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padding = mmToPx(6);
    let currentY = padding;

    ctx.fillStyle = primaryHsl;
    ctx.font = `bold ${mmToPx(6)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    
    const maxTextWidth = canvas.width - 2 * padding;
    const words = eventName.split(' ');
    let line = '';
    const lines = [];
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxTextWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    lines.forEach((l, index) => {
        ctx.fillText(l.trim(), canvas.width / 2, currentY + mmToPx(6) + (index * mmToPx(6)));
    });
    currentY += mmToPx(6) * lines.length + mmToPx(6);


    ctx.fillStyle = textHsl;
    ctx.font = `normal ${mmToPx(4.5)}px Inter, sans-serif`;
    ctx.fillText(`Guest: ${submittedRegistration.name}`, canvas.width / 2, currentY + mmToPx(4.5));
    currentY += mmToPx(8);

    ctx.font = `normal ${mmToPx(4)}px Inter, sans-serif`;
    ctx.fillText(`Email: ${submittedRegistration.email}`, canvas.width / 2, currentY + mmToPx(4));
    currentY += mmToPx(6);
    
    if (submittedRegistration.contactNumber) {
      ctx.fillText(`Contact: ${submittedRegistration.contactNumber}`, canvas.width / 2, currentY + mmToPx(4));
      currentY += mmToPx(6);
    }
    
    currentY += mmToPx(4); 

    const qrSizePx = mmToPx(40);
    
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvas.width - qrSizePx) / 2, currentY, qrSizePx, qrSizePx);
      currentY += qrSizePx + mmToPx(5);

      ctx.fillStyle = mutedHsl;
      ctx.font = `italic ${mmToPx(3.5)}px Inter, sans-serif`;
      ctx.fillText("Present this QR code at the event.", canvas.width / 2, currentY + mmToPx(3.5));

      const dataUrl = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfTicketWidthMm, pdfTicketHeightMm]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfTicketWidthMm, pdfTicketHeightMm);
      
      const safeEventName = eventName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const safeGuestName = submittedRegistration.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const fileName = `${safeEventName}-Ticket-${safeGuestName}.pdf`;
      pdf.save(fileName);
      reset(); 
      setSubmittedRegistration(null); 
    };
    qrImage.onerror = (err) => {
        console.error("Error loading QR code PNG for canvas drawing:", err);
        toast({ title: "Download Error", description: "Could not generate QR code image for PDF.", variant: "destructive" });
    }
    try {
        const qrCodePngDataUrl = await QRCodeToDataURL(submittedRegistration.id, {
          errorCorrectionLevel: 'H',
          width: 256, 
          margin: 1,
          type: 'image/png'
        });
        qrImage.src = qrCodePngDataUrl;
    } catch (e) {
        console.error("Error generating QR code PNG data URL:", e);
        toast({ title: "Download Error", description: "Could not generate QR code data for PDF.", variant: "destructive" });
    }
  };


  if (submittedRegistration) {
    return (
      <Card className="shadow-xl border-t-4 border-accent h-full flex flex-col items-center justify-center p-6 md:p-8">
        <CardHeader className="text-center pt-8 pb-4">
          <CheckCircle className="mx-auto h-20 w-20 text-accent mb-4" />
          <CardTitle className="text-foreground font-headline text-3xl">Registration Confirmed!</CardTitle>
          <CardDescription className="text-muted-foreground text-base pt-2">
            Thank you for registering for <span className="font-semibold text-primary">"{eventName}"</span>.<br/> Your ticket with a unique QR code can be downloaded below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-3 pt-4 pb-6 px-6 text-center">
          <p className="text-md text-foreground"><strong className="font-medium">Name:</strong> {submittedRegistration.name}</p>
          <p className="text-md text-foreground"><strong className="font-medium">Email:</strong> {submittedRegistration.email}</p>
          {submittedRegistration.contactNumber && (
            <p className="text-md text-foreground"><strong className="font-medium">Contact:</strong> {submittedRegistration.contactNumber}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 p-6 pt-2 w-full max-w-sm">
            <Button 
              variant="default" 
              onClick={handleDownloadTicket} 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <Download className="mr-2 h-5 w-5" /> Download Your Ticket (PDF)
            </Button>
          </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-t-4 border-primary h-full flex flex-col">
      <CardHeader className="pb-4 text-center">
        <CardTitle className="font-headline text-2xl md:text-3xl text-primary">Register for {eventName}</CardTitle>
        <CardDescription className="text-muted-foreground text-base pt-1">Fill in your details below to secure your spot.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow h-full">
        <CardContent className="flex-grow space-y-6 px-6 md:px-8">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base flex items-center">
              <User className="mr-2 h-5 w-5 text-muted-foreground" />
              Full Name
            </Label>
            <Input 
              id="name" 
              {...register("name")} 
              placeholder="e.g., John Doe" 
              className="py-6 text-base"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-destructive pt-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base flex items-center">
              <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
              Email Address
            </Label>
            <Input 
              id="email" 
              type="email" 
              {...register("email")} 
              placeholder="e.g., you@example.com" 
              className="py-6 text-base"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-sm text-destructive pt-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-base flex items-center">
              <Phone className="mr-2 h-5 w-5 text-muted-foreground" /> 
              Contact Number <span className="text-xs text-muted-foreground ml-1">(Optional)</span>
            </Label>
            <Input 
              id="contactNumber" 
              type="tel" 
              {...register("contactNumber")} 
              placeholder="e.g., +1 123 456 7890" 
              className="py-6 text-base"
              aria-invalid={errors.contactNumber ? "true" : "false"}
            />
            {errors.contactNumber && <p className="text-sm text-destructive pt-1">{errors.contactNumber.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="p-6 md:p-8 mt-auto">
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow" 
            disabled={isSubmitting}
          >
            {isSubmitting && <LoadingSpinner size={20} className="mr-2" />}
            {isSubmitting ? "Registering..." : "Register Now & Get PDF Ticket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
    
