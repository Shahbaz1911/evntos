
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
import { Download, Phone, CheckCircle } from 'lucide-react'; // Added CheckCircle
import jsPDF from 'jspdf';
import { renderToStaticMarkup } from 'react-dom/server';

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

  const handleDownloadTicket = () => {
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

    ctx.fillText(`Email: ${submittedRegistration.email}`, canvas.width / 2, currentY + mmToPx(4.5));
    currentY += mmToPx(8);
    
    if (submittedRegistration.contactNumber) {
      ctx.fillText(`Contact: ${submittedRegistration.contactNumber}`, canvas.width / 2, currentY + mmToPx(4.5));
      currentY += mmToPx(8);
    }
    
    currentY += mmToPx(4); 

    const qrSizePx = mmToPx(40);
    
    const qrCodeReactElement = <QRCodeSVG value={submittedRegistration.id} size={256} level="H" includeMargin={false} />;
    const qrSvgString = renderToStaticMarkup(qrCodeReactElement);
    
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, (canvas.width - qrSizePx) / 2, currentY, qrSizePx, qrSizePx);
      currentY += qrSizePx + mmToPx(5);

      ctx.fillStyle = textHsl;
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
    };
    qrImage.onerror = (err) => {
        console.error("Error loading QR SVG for canvas drawing:", err);
        toast({ title: "Download Error", description: "Could not generate QR code image for PDF.", variant: "destructive" });
    }
    try {
        const base64Svg = btoa(unescape(encodeURIComponent(qrSvgString)));
        qrImage.src = `data:image/svg+xml;base64,${base64Svg}`;
    } catch (e) {
        console.error("Error encoding SVG string:", e);
        toast({ title: "Download Error", description: "Could not encode QR code for PDF.", variant: "destructive" });
    }
  };


  if (submittedRegistration) {
    return (
      <Card className="bg-green-50 border-green-200 shadow-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <CardTitle className="text-green-700 font-headline text-2xl">Registration Confirmed!</CardTitle>
          <CardDescription className="text-green-600">
            Thank you for registering for "{eventName}".<br/> Your ticket with a unique QR code can be downloaded below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground"><strong>Name:</strong> {submittedRegistration.name}</p>
          <p className="text-sm text-muted-foreground"><strong>Email:</strong> {submittedRegistration.email}</p>
          {submittedRegistration.contactNumber && (
            <p className="text-sm text-muted-foreground"><strong>Contact:</strong> {submittedRegistration.contactNumber}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
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
            {isSubmitting ? "Registering..." : "Register Now & Get PDF Ticket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

