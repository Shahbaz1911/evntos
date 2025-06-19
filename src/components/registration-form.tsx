
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
import { Download, Phone, CheckCircle, User, Mail, Ticket } from 'lucide-react';
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

  const drawTextWithWrapping = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines?: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      if (maxLines && linesDrawn >= maxLines) {
        if (n < words.length -1) line += '...'; // Add ellipsis if text is truncated
        break;
      }
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
        if (maxLines && linesDrawn >= maxLines && n < words.length -1) {
             const lastLineText = line.trim();
             const ellipsisWidth = ctx.measureText('...').width;
             let truncatedLastLine = '';
             for(let i = 0; i < lastLineText.length; i++){
                if(ctx.measureText(truncatedLastLine + lastLineText[i] + '...').width > maxWidth){
                    break;
                }
                truncatedLastLine += lastLineText[i];
             }
             ctx.fillText(truncatedLastLine + '...', x, currentY);
             return currentY + lineHeight;
        }

      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
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
    const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

    canvas.width = mmToPx(pdfTicketWidthMm);
    canvas.height = mmToPx(pdfTicketHeightMm);

    // Get theme colors
    const rootStyle = getComputedStyle(document.documentElement);
    const primaryColor = `hsl(${rootStyle.getPropertyValue('--primary').trim()})`;
    const primaryFgColor = `hsl(${rootStyle.getPropertyValue('--primary-foreground').trim()})`;
    const cardColor = `hsl(${rootStyle.getPropertyValue('--card').trim()})`;
    const textColor = `hsl(${rootStyle.getPropertyValue('--card-foreground').trim()})`;
    const mutedTextColor = `hsl(${rootStyle.getPropertyValue('--muted-foreground').trim()})`;
    const borderColor = `hsl(${rootStyle.getPropertyValue('--border').trim()})`;

    // Background
    ctx.fillStyle = cardColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Border (optional, for a defined edge)
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = mmToPx(0.5);
    ctx.strokeRect(mmToPx(2), mmToPx(2), canvas.width - mmToPx(4), canvas.height - mmToPx(4));


    const contentPadding = mmToPx(5);
    const contentWidth = canvas.width - 2 * contentPadding;

    // Header section
    ctx.fillStyle = primaryColor;
    const headerHeight = mmToPx(22);
    ctx.fillRect(contentPadding, contentPadding, contentWidth, headerHeight);

    ctx.fillStyle = primaryFgColor;
    ctx.font = `bold ${mmToPx(5.5)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    let currentY = contentPadding + headerHeight / 2 + mmToPx(2); // Center vertically in header
    currentY = drawTextWithWrapping(ctx, eventName, canvas.width / 2, currentY - mmToPx(5.5)/2 , contentWidth - mmToPx(4), mmToPx(6), 2);
    currentY = contentPadding + headerHeight + mmToPx(6);


    // "Guest Ticket" Sub-header
    ctx.fillStyle = textColor;
    ctx.font = `normal ${mmToPx(4.5)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText("GUEST TICKET", canvas.width / 2, currentY);
    currentY += mmToPx(7);

    // Guest Details
    ctx.textAlign = 'left';
    const detailIndent = contentPadding + mmToPx(3);
    const detailMaxWidth = contentWidth - mmToPx(6);

    ctx.font = `bold ${mmToPx(4)}px Inter, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.fillText("Name:", detailIndent, currentY);
    ctx.font = `normal ${mmToPx(4)}px Inter, sans-serif`;
    currentY = drawTextWithWrapping(ctx, submittedRegistration.name, detailIndent + mmToPx(20), currentY, detailMaxWidth - mmToPx(20), mmToPx(5));
    currentY += mmToPx(3);

    ctx.font = `bold ${mmToPx(4)}px Inter, sans-serif`;
    ctx.fillText("Email:", detailIndent, currentY);
    ctx.font = `normal ${mmToPx(4)}px Inter, sans-serif`;
    currentY = drawTextWithWrapping(ctx, submittedRegistration.email, detailIndent + mmToPx(20), currentY, detailMaxWidth - mmToPx(20), mmToPx(5));
    currentY += mmToPx(3);

    if (submittedRegistration.contactNumber) {
      ctx.font = `bold ${mmToPx(4)}px Inter, sans-serif`;
      ctx.fillText("Contact:", detailIndent, currentY);
      ctx.font = `normal ${mmToPx(4)}px Inter, sans-serif`;
      currentY = drawTextWithWrapping(ctx, submittedRegistration.contactNumber, detailIndent + mmToPx(20), currentY, detailMaxWidth - mmToPx(20), mmToPx(5));
      currentY += mmToPx(3);
    }
    currentY += mmToPx(5); // Extra space before QR

    // QR Code
    const qrSizePx = mmToPx(40);
    const qrX = (canvas.width - qrSizePx) / 2;
    const qrY = currentY;

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, qrX, qrY, qrSizePx, qrSizePx);
      currentY = qrY + qrSizePx + mmToPx(7);

      // Footer instruction
      ctx.fillStyle = mutedTextColor;
      ctx.font = `italic ${mmToPx(3.5)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText("Present this QR code at the event entrance.", canvas.width / 2, currentY);
      currentY += mmToPx(5);

      // "Eventos" Branding (subtle)
      ctx.font = `normal ${mmToPx(3)}px Inter, sans-serif`;
      ctx.fillStyle = mutedTextColor;
      ctx.fillText("Powered by Eventos", canvas.width / 2, canvas.height - contentPadding + mmToPx(2));


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
          width: 300, // Higher resolution for QR code generation
          margin: 1,
          type: 'image/png',
          color: {
            dark: primaryColor.startsWith('hsl') ? primaryColor : '#000000', // Use primary theme color for QR dots
            light: '#00000000' // Transparent background for QR code
          }
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
         <Ticket className="mx-auto h-12 w-12 text-primary mb-3" />
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
