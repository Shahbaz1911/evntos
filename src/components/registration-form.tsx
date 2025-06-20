
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
import { Download, Phone, CheckCircle, User, Mail, Ticket as TicketIconLucide } from 'lucide-react'; 
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
    maxLines: number = 99,
    addEllipsis: boolean = false
  ): number => { 
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let i = 0; i < words.length; i++) {
      if (linesDrawn >= maxLines) break;

      const testLineAttempt = line + words[i] + ' ';
      const testWidth = ctx.measureText(testLineAttempt).width;

      if (testWidth > maxWidth && line !== '') { 
        let lineToPrint = line.trim();
        if (addEllipsis && linesDrawn === maxLines - 1 && i < words.length) { 
          while (ctx.measureText(lineToPrint + '...').width > maxWidth && lineToPrint.length > 0) {
            lineToPrint = lineToPrint.slice(0, -1);
          }
          lineToPrint += '...';
        }
        ctx.fillText(lineToPrint, x, currentY);
        currentY += lineHeight;
        linesDrawn++;
        if (linesDrawn >= maxLines) {
          line = ''; 
          break;
        }
        line = words[i] + ' '; 
      } else { 
        line = testLineAttempt;
      }
    }

    if (line.trim() !== '' && linesDrawn < maxLines) {
      let lineToPrint = line.trim();
      if (ctx.measureText(lineToPrint).width > maxWidth) { 
        if (addEllipsis) {
            while (ctx.measureText(lineToPrint + '...').width > maxWidth && lineToPrint.length > 0) {
                lineToPrint = lineToPrint.slice(0, -1);
            }
            lineToPrint += '...';
        } else {
            while (ctx.measureText(lineToPrint).width > maxWidth && lineToPrint.length > 0) {
                lineToPrint = lineToPrint.slice(0, -1);
            }
        }
      }
      ctx.fillText(lineToPrint, x, currentY);
      currentY += lineHeight;
    }
    return currentY; 
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

    // Fixed Light Theme Colors for PDF
    const primaryHex = '#F97316';       // Vibrant Orange (from light theme --primary)
    const primaryFgHex = '#FFFFFF';     // White (from light theme --primary-foreground)
    const cardHex = '#FFFFFF';          // White (from light theme --card)
    const textHex = '#1A1A1A';          // Very Dark Brown/Almost Black (approximated from --foreground 24 10% 10%)
    const mutedTextHex = '#785A48';     // Muted Brownish Orange (approximated from --muted-foreground 25 30% 45%)
    const borderHex = '#FFDEC2';        // Light Peach Border (from light theme --border)

    // --- Drawing Start ---
    ctx.fillStyle = cardHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = borderHex;
    ctx.lineWidth = mmToPx(0.3);
    ctx.strokeRect(mmToPx(2), mmToPx(2), canvas.width - mmToPx(4), canvas.height - mmToPx(4));

    const contentPadding = mmToPx(5);
    const contentWidth = canvas.width - 2 * contentPadding;
    let currentY = contentPadding;

    // 1. Header Section (Event Title)
    const headerHeight = mmToPx(20);
    ctx.fillStyle = primaryHex;
    ctx.fillRect(contentPadding, currentY, contentWidth, headerHeight);

    ctx.fillStyle = primaryFgHex;
    ctx.font = `bold ${mmToPx(5)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    const eventTitleLineHeight = mmToPx(6);
    const eventTitleTextY = currentY + (headerHeight / 2) - eventTitleLineHeight + (eventTitleLineHeight * 0.9);
    drawTextWithWrapping(ctx, `Event: ${eventName}`, canvas.width / 2, eventTitleTextY, contentWidth - mmToPx(8), eventTitleLineHeight, 2, true);
    currentY += headerHeight + mmToPx(6); 

    // 2. "GUEST TICKET" Sub-header
    ctx.fillStyle = textHex;
    ctx.font = `bold ${mmToPx(4.2)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    currentY = drawTextWithWrapping(ctx, "GUEST TICKET", canvas.width / 2, currentY, contentWidth, mmToPx(5), 1);
    currentY += mmToPx(7); 

    // 3. Guest Details Section
    const detailIndent = contentPadding + mmToPx(2);

    const drawDetailItem = (labelText: string, valueText: string, valueMaxLines: number = 2) => {
        const textStartX = detailIndent;
        const availableTextWidth = contentWidth - mmToPx(4); 

        // Label
        ctx.font = `bold ${mmToPx(3.2)}px Inter, sans-serif`;
        ctx.fillStyle = mutedTextHex;
        ctx.textAlign = 'left';
        currentY = drawTextWithWrapping(ctx, labelText, textStartX, currentY, availableTextWidth, mmToPx(4), 1);

        // Value
        ctx.font = `normal ${mmToPx(3.5)}px Inter, sans-serif`;
        ctx.fillStyle = textHex;
        ctx.textAlign = 'left';
        currentY = drawTextWithWrapping(ctx, valueText, textStartX, currentY, availableTextWidth, mmToPx(4.5), valueMaxLines, false);
        currentY += mmToPx(3.5); 
    };

    drawDetailItem("Guest Name:", submittedRegistration.name, 2);
    drawDetailItem("Email Address:", submittedRegistration.email, 2);
    if (submittedRegistration.contactNumber) {
      drawDetailItem("Contact:", submittedRegistration.contactNumber, 1);
    }
    currentY += mmToPx(3); 

    // 4. QR Code
    const qrSizePx = mmToPx(35);
    const qrX = (canvas.width - qrSizePx) / 2;
    const qrY = currentY;

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, qrX, qrY, qrSizePx, qrSizePx);
      let postQrY = qrY + qrSizePx + mmToPx(5);

      // 5. Instructions
      ctx.fillStyle = mutedTextHex;
      ctx.font = `italic ${mmToPx(3)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      postQrY = drawTextWithWrapping(ctx, "Present this QR code at the event entrance for verification.", canvas.width / 2, postQrY, contentWidth - mmToPx(6), mmToPx(3.8), 2);
      
      // 6. Footer Branding - Positioned at the very bottom
      const footerTextY = canvas.height - contentPadding + mmToPx(0.5); 
      ctx.font = `normal ${mmToPx(2.5)}px Inter, sans-serif`;
      ctx.fillStyle = mutedTextHex;
      ctx.textAlign = 'center';
      
      if (postQrY < footerTextY - mmToPx(5)) { 
         ctx.fillText("Powered by Evntos", canvas.width / 2, footerTextY);
      } else {
         ctx.fillText("Powered by Evntos", canvas.width / 2, postQrY + mmToPx(4)); 
      }

      // --- Drawing End ---
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
        console.error("Error loading QR code for canvas drawing:", err);
        toast({ title: "Download Error", description: "Could not generate QR code image for PDF.", variant: "destructive" });
    }
    try {
        const qrCodePngDataUrl = await QRCodeToDataURL(submittedRegistration.id, {
          errorCorrectionLevel: 'H', 
          width: 300, 
          margin: 1, 
          type: 'image/png',
          color: {
            dark: primaryHex, // Use the fixed light theme primary color
            light: '#00000000' // Transparent background for the light part
          }
        });
        qrImage.src = qrCodePngDataUrl;
    } catch (e) {
        console.error("Error generating QR code data URL:", e);
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
         <TicketIconLucide className="mx-auto h-12 w-12 text-primary mb-3" />
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

