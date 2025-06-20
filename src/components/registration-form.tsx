
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
import { Download, Phone, CheckCircle, User, Mail, Ticket as TicketIconLucide } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
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

  const drawWrappedText = (
    page: any, // PDFPage
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    font: any, // PDFFont
    size: number,
    color: any // RGBColor
  ): number => {
    const words = text.split(' ');
    let currentLine = '';
    let currentY = y;
  
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
  
      if (testWidth > maxWidth && currentLine !== '') {
        page.drawText(currentLine, { x, y: currentY, font, size, color });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
  
    if (currentLine !== '') {
      page.drawText(currentLine, { x, y: currentY, font, size, color });
      currentY -= lineHeight;
    }
    return currentY; // Return the Y position after the last line drawn
  };


  const handleDownloadTicket = async () => {
    if (!submittedRegistration) return;

    const eventDetails = getEventById(submittedRegistration.eventId);
    if (!eventDetails) {
        toast({ title: "Ticket Download Error", description: "Could not fetch event details for the ticket.", variant: "destructive" });
        return;
    }

    try {
        const pdfDoc = await PDFDocument.create();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const primaryOrange = rgb(249 / 255, 115 / 255, 22 / 255); // #F97316
        const blackColor = rgb(0, 0, 0);
        const whiteColor = rgb(1, 1, 1);
        const grayColor = rgb(0.3, 0.3, 0.3);
        const lightGrayColor = rgb(0.5, 0.5, 0.5);

        // Page 1: Main Ticket
        const page1TicketWidth = 226.77; // ~80mm
        const page1TicketHeight = 425.19; // ~150mm
        const page1 = pdfDoc.addPage([page1TicketWidth, page1TicketHeight]);
        const { width: p1W, height: p1H } = page1.getSize();
        const p1Margin = 18; // points
        let p1Y = p1H - p1Margin - 15;

        // Evntos Logo (Orange)
        const logoText = "evntos";
        const logoSize = 22;
        page1.drawText(logoText, {
            x: p1W / 2 - helveticaBoldFont.widthOfTextAtSize(logoText, logoSize) / 2,
            y: p1Y,
            font: helveticaBoldFont,
            size: logoSize,
            color: primaryOrange,
        });
        p1Y -= (logoSize + 10);

        // Event Title Banner
        const eventTitleBannerHeight = 28;
        p1Y -= 10; // Space before banner
        page1.drawRectangle({
            x: p1Margin,
            y: p1Y - eventTitleBannerHeight,
            width: p1W - 2 * p1Margin,
            height: eventTitleBannerHeight,
            color: blackColor,
        });
        
        const eventTitleText = eventDetails.title;
        const eventTitleFontSize = 11;
        // Simple truncation for event title in banner
        const maxEventTitleCharsInBanner = 38;
        const displayEventTitle = eventTitleText.length > maxEventTitleCharsInBanner 
            ? eventTitleText.substring(0, maxEventTitleCharsInBanner - 3) + "..."
            : eventTitleText;
        const eventTitleTextWidth = helveticaBoldFont.widthOfTextAtSize(displayEventTitle, eventTitleFontSize);
        
        page1.drawText(displayEventTitle, {
            x: p1Margin + (p1W - 2 * p1Margin - eventTitleTextWidth) / 2, // Centered in banner
            y: p1Y - eventTitleBannerHeight / 2 - eventTitleFontSize / 2 + 3.5, // Vertically center
            font: helveticaBoldFont,
            size: eventTitleFontSize,
            color: whiteColor,
        });
        p1Y -= (eventTitleBannerHeight + 15);

        // "GUEST TICKET"
        const guestTicketText = "GUEST TICKET";
        const guestTicketSize = 13;
        page1.drawText(guestTicketText, {
            x: p1W / 2 - helveticaBoldFont.widthOfTextAtSize(guestTicketText, guestTicketSize) / 2,
            y: p1Y,
            font: helveticaBoldFont,
            size: guestTicketSize,
            color: blackColor,
        });
        p1Y -= (guestTicketSize + 15);

        // QR Code
        const qrCodeDataUrl = await QRCodeToDataURL(submittedRegistration.id, {
            errorCorrectionLevel: 'H', width: 250, margin: 1, type: 'image/png',
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), c => c.charCodeAt(0));
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        const qrSize = 75; // points
        page1.drawImage(qrImage, {
            x: p1W / 2 - qrSize / 2,
            y: p1Y - qrSize,
            width: qrSize,
            height: qrSize,
        });
        p1Y -= (qrSize + 8);

        // Guest Name
        const nameText = `Name: ${submittedRegistration.name}`;
        const nameSize = 10;
        p1Y = drawWrappedText(page1, nameText, p1Margin, p1Y, p1W - 2 * p1Margin, nameSize + 2, helveticaFont, nameSize, blackColor);
        p1Y -= 5;


        // Ticket ID
        const ticketIdText = `Ticket ID: ${submittedRegistration.id}`;
        const ticketIdSize = 8;
        p1Y = drawWrappedText(page1, ticketIdText, p1Margin, p1Y, p1W - 2 * p1Margin, ticketIdSize + 2, helveticaFont, ticketIdSize, grayColor);
        p1Y -= 10;
        
        // Brief instruction
        const instructionText = "Present this page for entry.";
        const instructionSize = 8;
        page1.drawText(instructionText, {
            x: p1W / 2 - helveticaFont.widthOfTextAtSize(instructionText, instructionSize) / 2,
            y: p1Y,
            font: helveticaFont,
            size: instructionSize,
            color: lightGrayColor,
        });


        // Page 2: Additional Details
        const page2 = pdfDoc.addPage([page1TicketWidth, page1TicketHeight]);
        const { width: p2W, height: p2H } = page2.getSize();
        const p2Margin = 20;
        let p2Y = p2H - p2Margin - 15;

        const additionalInfoText = "Additional Information";
        const additionalInfoSize = 12;
        page2.drawText(additionalInfoText, {
            x: p2Margin,
            y: p2Y,
            font: helveticaBoldFont,
            size: additionalInfoSize,
            color: blackColor,
        });
        p2Y -= (additionalInfoSize + 12);

        const detailFontSize = 9;
        const detailLineHeight = detailFontSize + 3;

        const drawDetailItem = (label: string, value: string) => {
            page2.drawText(label, { x: p2Margin, y: p2Y, font: helveticaBoldFont, size: detailFontSize, color: blackColor });
            p2Y -= detailLineHeight;
            p2Y = drawWrappedText(page2, value, p2Margin, p2Y, p2W - 2*p2Margin, detailLineHeight, helveticaFont, detailFontSize, blackColor );
            p2Y -= (detailLineHeight / 2); // Small gap after value
        };

        drawDetailItem("Full Name:", submittedRegistration.name);
        drawDetailItem("Email:", submittedRegistration.email);
        if (submittedRegistration.contactNumber) {
            drawDetailItem("Contact:", submittedRegistration.contactNumber);
        }
        drawDetailItem("Registered At:", new Date(submittedRegistration.registeredAt).toLocaleString());
        
        p2Y -= (detailLineHeight); // Extra space before event details

        drawDetailItem("Event Name:", eventDetails.title);
        drawDetailItem("Event Date & Time:", formatEventDateTimeForPdf(eventDetails.eventDate, eventDetails.eventTime));
        const venueText = eventDetails.mapLink ? "Details on event page / map link" : "Not specified";
        drawDetailItem("Venue:", venueText);

        // Powered by evntos - Footer on last page
        const footerText = "Powered by evntos";
        const footerSize = 8;
        page2.drawText(footerText, {
            x: p2W / 2 - helveticaFont.widthOfTextAtSize(footerText, footerSize) / 2,
            y: p2Margin, // At the bottom
            font: helveticaFont,
            size: footerSize,
            color: lightGrayColor,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeEventName = eventDetails.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        const safeGuestName = submittedRegistration.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
        link.download = `${safeEventName}-Ticket-${safeGuestName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        reset();
        setSubmittedRegistration(null);

    } catch (error) {
        console.error("Error generating PDF ticket with pdf-lib:", error);
        toast({ title: "Ticket Download Error", description: "Could not generate PDF ticket. Please try again.", variant: "destructive" });
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

