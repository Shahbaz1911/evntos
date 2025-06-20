
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
import type { Registration, Event as EventType } from '@/types';
import { Download, Phone, CheckCircle, User, Mail, Ticket as TicketIconLucide, CalendarDays, Clock, MapPin, Building } from 'lucide-react'; 
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

const formatEventDateTimeForPdf = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || dateStr.trim() === "" || !timeStr || timeStr.trim() === "") {
    return "N/A";
  }
  try {
    const dateTime = new Date(`${dateStr.trim()}T${timeStr.trim()}:00`);
    if (isNaN(dateTime.getTime())) return "Invalid Date/Time";
    
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${dateTime.toLocaleDateString(undefined, dateOptions)}, ${dateTime.toLocaleTimeString(undefined, timeOptions)}`;
  } catch (e) {
    return "Error formatting date/time";
  }
};


export default function RegistrationForm({ eventId, eventName }: RegistrationFormProps) {
  const { addRegistration, getEventById } = useEvents();
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

    const eventDetails = getEventById(submittedRegistration.eventId);
    if (!eventDetails) {
        toast({ title: "Ticket Download Error", description: "Could not fetch event details for the ticket.", variant: "destructive" });
        return;
    }

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

    const primaryHex = '#F97316';
    const primaryFgHex = '#FFFFFF';
    const cardHex = '#FFFFFF';
    const textHex = '#1A1A1A';
    const mutedTextHex = '#785A48';
    const borderHex = '#FFDEC2';

    ctx.fillStyle = cardHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = borderHex;
    ctx.lineWidth = mmToPx(0.3);
    ctx.strokeRect(mmToPx(2), mmToPx(2), canvas.width - mmToPx(4), canvas.height - mmToPx(4));

    const contentPadding = mmToPx(5);
    const contentWidth = canvas.width - 2 * contentPadding;
    let currentY = contentPadding;

    // Evntos Logo (Text based)
    ctx.fillStyle = primaryHex;
    ctx.font = `bold ${mmToPx(6)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    currentY = drawTextWithWrapping(ctx, "evntos", canvas.width / 2, currentY + mmToPx(2), contentWidth, mmToPx(7), 1) + mmToPx(2);

    // Header Section (Event Title)
    const headerHeight = mmToPx(16); // Reduced height for event title
    ctx.fillStyle = primaryHex;
    ctx.fillRect(contentPadding, currentY, contentWidth, headerHeight);

    ctx.fillStyle = primaryFgHex;
    ctx.font = `bold ${mmToPx(4.5)}px Inter, sans-serif`; // Slightly smaller for event title
    ctx.textAlign = 'center';
    const eventTitleLineHeight = mmToPx(5);
    const eventTitleTextY = currentY + (headerHeight / 2) - eventTitleLineHeight + (eventTitleLineHeight * 0.9);
    currentY = drawTextWithWrapping(ctx, eventDetails.title, canvas.width / 2, eventTitleTextY, contentWidth - mmToPx(6), eventTitleLineHeight, 2, true);
    currentY += headerHeight + mmToPx(5);


    // "GUEST TICKET" Sub-header
    ctx.fillStyle = textHex;
    ctx.font = `bold ${mmToPx(4)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    currentY = drawTextWithWrapping(ctx, "GUEST TICKET", canvas.width / 2, currentY, contentWidth, mmToPx(4.5), 1);
    currentY += mmToPx(5); 

    const detailIndent = contentPadding + mmToPx(2);
    const detailValueIndent = detailIndent + mmToPx(20); // Indent for values
    const valueMaxWidth = contentWidth - mmToPx(22);


    const drawDetailItem = (labelText: string, valueText: string, valueMaxLines: number = 2, icon?: (ctx: CanvasRenderingContext2D, x:number, y:number, size:number) => void) => {
        const textStartX = detailIndent;
        const iconSize = mmToPx(3.2);
        let yPos = currentY;

        if (icon) {
            icon(ctx, textStartX, yPos - iconSize*0.1, iconSize); // Draw icon
        }
        
        // Label
        ctx.font = `bold ${mmToPx(3)}px Inter, sans-serif`;
        ctx.fillStyle = mutedTextHex;
        ctx.textAlign = 'left';
        const labelYOffset = icon ? mmToPx(0.5) : 0; // Adjust label Y if icon is present
        yPos = drawTextWithWrapping(ctx, labelText, textStartX + (icon ? iconSize + mmToPx(1.5) : 0), yPos + labelYOffset, contentWidth - (icon ? iconSize + mmToPx(1.5) : 0), mmToPx(3.8), 1);

        // Value
        ctx.font = `normal ${mmToPx(3.2)}px Inter, sans-serif`;
        ctx.fillStyle = textHex;
        ctx.textAlign = 'left';
        currentY = drawTextWithWrapping(ctx, valueText, textStartX + (icon ? iconSize + mmToPx(1.5) : 0), yPos, valueMaxWidth - (icon ? iconSize + mmToPx(1.5) : 0), mmToPx(4), valueMaxLines, false);
        currentY += mmToPx(3);
    };
    
    // --- Guest Details ---
    ctx.font = `bold ${mmToPx(3.5)}px Inter, sans-serif`;
    ctx.fillStyle = primaryHex;
    currentY = drawTextWithWrapping(ctx, "Guest Information", detailIndent, currentY, contentWidth, mmToPx(4)) + mmToPx(1);

    drawDetailItem("Name:", submittedRegistration.name, 2);
    drawDetailItem("Email:", submittedRegistration.email, 2);
    if (submittedRegistration.contactNumber) {
      drawDetailItem("Contact:", submittedRegistration.contactNumber, 1);
    }
    drawDetailItem("Registered:", new Date(submittedRegistration.registeredAt).toLocaleString(), 2);
    drawDetailItem("Ticket ID:", submittedRegistration.id, 1);
    currentY += mmToPx(2);

    // --- Event Details ---
    ctx.font = `bold ${mmToPx(3.5)}px Inter, sans-serif`;
    ctx.fillStyle = primaryHex;
    currentY = drawTextWithWrapping(ctx, "Event Details", detailIndent, currentY, contentWidth, mmToPx(4)) + mmToPx(1);
    
    drawDetailItem("Event:", eventDetails.title, 2);
    drawDetailItem("Date & Time:", formatEventDateTimeForPdf(eventDetails.eventDate, eventDetails.eventTime), 2);
    
    const venueText = eventDetails.mapLink ? "Details on event page" : "Not specified";
    drawDetailItem("Venue:", venueText, 2);
    currentY += mmToPx(4);


    // QR Code
    const qrSizePx = mmToPx(30); // Slightly smaller QR
    const qrX = (canvas.width - qrSizePx) / 2;
    const qrY = currentY;

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, qrX, qrY, qrSizePx, qrSizePx);
      let postQrY = qrY + qrSizePx + mmToPx(4);

      // Instructions
      ctx.fillStyle = mutedTextHex;
      ctx.font = `italic ${mmToPx(2.8)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      postQrY = drawTextWithWrapping(ctx, "Present this QR code at the event entrance for verification.", canvas.width / 2, postQrY, contentWidth - mmToPx(6), mmToPx(3.5), 2);
      
      const footerTextY = canvas.height - contentPadding + mmToPx(1); 
      ctx.font = `normal ${mmToPx(2.5)}px Inter, sans-serif`;
      ctx.fillStyle = mutedTextHex;
      ctx.textAlign = 'center';
      
      const finalContentBottom = Math.max(postQrY, currentY); //Furthest point reached by content
      const poweredByY = Math.max(finalContentBottom + mmToPx(3), footerTextY - mmToPx(2)); // Ensure it's below content and near bottom
      ctx.fillText("Powered by evntos", canvas.width / 2, poweredByY);


      const dataUrl = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfTicketWidthMm, pdfTicketHeightMm]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfTicketWidthMm, pdfTicketHeightMm);

      const safeEventName = eventDetails.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
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
            dark: textHex, 
            light: '#00000000' 
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

