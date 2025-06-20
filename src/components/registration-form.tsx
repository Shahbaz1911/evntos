
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
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage, RGB } from 'pdf-lib';
import { toDataURL as QRCodeToDataURL } from 'qrcode';
import { sendTicketEmail } from '@/ai/flows/send-ticket-email-flow';


const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
  email: z.string().email("Invalid email address.").max(100),
  contactNumber: z.string()
    .min(5, "Contact number seems too short.")
    .max(20, "Contact number seems too long.")
    .regex(/^[+\d()-\s]*$/, "Invalid characters in contactNumber. Use numbers, spaces, -, (, ).")
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
    const dateTime = new Date(\`\${dateStr.trim()}T\${timeStr.trim()}:00\`);
    if (isNaN(dateTime.getTime())) return "Invalid Date/Time";
    
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return \`\${dateTime.toLocaleDateString(undefined, dateOptions)}, \${dateTime.toLocaleTimeString(undefined, timeOptions)}\`;
  } catch (e) {
    return "Error formatting date/time";
  }
};

const drawWrappedText = (
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    font: PDFFont,
    size: number,
    color: RGB,
    options?: { textAlign?: 'left' | 'center' | 'right' }
  ): number => {
    const words = text.split(' ');
    let currentLine = '';
    let currentY = y;
  
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
  
      if (testWidth > maxWidth && currentLine !== '') {
        let drawX = x;
        if (options?.textAlign === 'center') {
            drawX = x + (maxWidth - font.widthOfTextAtSize(currentLine, size)) / 2;
        } else if (options?.textAlign === 'right') {
            drawX = x + (maxWidth - font.widthOfTextAtSize(currentLine, size));
        }
        page.drawText(currentLine, { x: drawX, y: currentY, font, size, color });
        currentY -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
  
    if (currentLine !== '') {
        let drawX = x;
        if (options?.textAlign === 'center') {
            drawX = x + (maxWidth - font.widthOfTextAtSize(currentLine, size)) / 2;
        } else if (options?.textAlign === 'right') {
            drawX = x + (maxWidth - font.widthOfTextAtSize(currentLine, size));
        }
      page.drawText(currentLine, { x: drawX, y: currentY, font, size, color });
      currentY -= lineHeight;
    }
    return currentY; 
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
        setSubmittedRegistration(newRegistration);
        // Now call the Genkit flow to send the email
        const eventDetails = getEventById(eventId);
        if (eventDetails) {
            try {
                const emailResult = await sendTicketEmail({
                    registrationId: newRegistration.id,
                    userName: newRegistration.name,
                    userEmail: newRegistration.email,
                    eventDetails: {
                        title: eventDetails.title,
                        eventDate: eventDetails.eventDate,
                        eventTime: eventDetails.eventTime,
                        venueName: eventDetails.venueName,
                        venueAddress: eventDetails.venueAddress,
                        mapLink: eventDetails.mapLink,
                    }
                });
                if (emailResult.success) {
                    toast({
                        title: "Registration Successful!",
                        description: \`You're registered for "\${eventName}". Your PDF ticket has been emailed to \${newRegistration.email}.\`,
                    });
                } else {
                     toast({
                        title: "Registration Successful (Email Failed)",
                        description: \`You're registered, but we couldn't email your ticket: \${emailResult.message}. You can download it below.\`,
                        variant: "default", // or "warning" if you have one
                    });
                }
            } catch (flowError: any) {
                console.error("Error calling sendTicketEmail flow:", flowError);
                toast({
                    title: "Registration Successful (Email Error)",
                    description: \`You're registered, but there was an error sending your ticket email: \${flowError.message || 'Unknown flow error'}. You can download it below.\`,
                    variant: "default",
                });
            }
        } else {
            toast({
                title: "Registration Successful (Event Details Missing)",
                description: "You're registered, but we couldn't find event details to email your ticket. You can download it below.",
                variant: "default",
            });
        }
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

    const eventDetails = getEventById(submittedRegistration.eventId);
    if (!eventDetails) {
        toast({ title: "Ticket Download Error", description: "Could not fetch event details for the ticket.", variant: "destructive" });
        return;
    }

    try {
        const pdfDoc = await PDFDocument.create();
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const primaryOrange = rgb(249 / 255, 115 / 255, 22 / 255); 
        const blackColor = rgb(0, 0, 0);
        const whiteColor = rgb(1, 1, 1);
        const grayColor = rgb(0.3, 0.3, 0.3); 
        const lightGrayColor = rgb(0.5, 0.5, 0.5);

        const ticketWidthMm = 80;
        const ticketHeightMm = 150;
        const mmToPoints = (mm: number) => mm * 2.83465; 

        const pageTicketWidth = mmToPoints(ticketWidthMm);
        const pageTicketHeight = mmToPoints(ticketHeightMm);
        
        // --- Page 1: Main Ticket ---
        const page1 = pdfDoc.addPage([pageTicketWidth, pageTicketHeight]);
        const { width: p1W, height: p1H } = page1.getSize();
        const p1Margin = mmToPoints(6); 
        const p1ContentWidth = p1W - 2 * p1Margin;
        let p1Y = p1H - p1Margin - mmToPoints(5); 

        const logoText = "evntos";
        const logoSize = 22;
        page1.drawText(logoText, {
            x: p1W / 2 - helveticaBoldFont.widthOfTextAtSize(logoText, logoSize) / 2,
            y: p1Y,
            font: helveticaBoldFont,
            size: logoSize,
            color: primaryOrange,
        });
        p1Y -= (logoSize + mmToPoints(6)); 

        const eventTitleBannerHeight = mmToPoints(12);
        const eventTitleFontSize = 11;
        
        page1.drawRectangle({
            x: p1Margin,
            y: p1Y - eventTitleBannerHeight,
            width: p1ContentWidth,
            height: eventTitleBannerHeight,
            color: blackColor,
        });
        
        const eventTitleText = eventDetails.title;
        const titleTextYOffset = (eventTitleBannerHeight - eventTitleFontSize) / 2 + (eventTitleFontSize * 0.1); // Fine tune vertical centering
        drawWrappedText(page1, eventTitleText, p1Margin + mmToPoints(1), p1Y - titleTextYOffset , p1ContentWidth - mmToPoints(2), eventTitleFontSize + 2, helveticaBoldFont, eventTitleFontSize, whiteColor, {textAlign: 'center'});
        p1Y -= (eventTitleBannerHeight + mmToPoints(7)); 

        const guestTicketText = "GUEST TICKET";
        const guestTicketSize = 14;
        page1.drawText(guestTicketText, {
            x: p1W / 2 - helveticaBoldFont.widthOfTextAtSize(guestTicketText, guestTicketSize) / 2,
            y: p1Y,
            font: helveticaBoldFont,
            size: guestTicketSize,
            color: blackColor,
        });
        p1Y -= (guestTicketSize + mmToPoints(5));

        const qrCodeDataUrl = await QRCodeToDataURL(submittedRegistration.id, {
            errorCorrectionLevel: 'H', width: 350, margin: 1, type: 'image/png',
            color: { dark: '#000000', light: '#FFFFFF' }
        });
        const qrImageBytes = Uint8Array.from(atob(qrCodeDataUrl.split(',')[1]), c => c.charCodeAt(0));
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        const qrDisplaySize = mmToPoints(40); 
        page1.drawImage(qrImage, {
            x: p1W / 2 - qrDisplaySize / 2,
            y: p1Y - qrDisplaySize,
            width: qrDisplaySize,
            height: qrDisplaySize,
        });
        p1Y -= (qrDisplaySize + mmToPoints(4));

        const nameText = submittedRegistration.name;
        const nameSize = 12;
        const nameLineHeight = nameSize + 3;
        p1Y = drawWrappedText(page1, nameText, p1Margin, p1Y, p1ContentWidth, nameLineHeight, helveticaBoldFont, nameSize, blackColor, {textAlign: 'center'});
        p1Y -= mmToPoints(3);
        
        const ticketIdText = \`Ticket ID: \${submittedRegistration.id}\`;
        const ticketIdSize = 9;
        const ticketIdLineHeight = ticketIdSize + 2;
        p1Y = drawWrappedText(page1, ticketIdText, p1Margin, p1Y, p1ContentWidth, ticketIdLineHeight, helveticaFont, ticketIdSize, grayColor, {textAlign: 'center'});
        p1Y -= mmToPoints(6);
        
        const instructionText = "Present this page for entry.";
        const instructionSize = 9;
        page1.drawText(instructionText, {
            x: p1W / 2 - helveticaFont.widthOfTextAtSize(instructionText, instructionSize) / 2,
            y: p1Y,
            font: helveticaFont,
            size: instructionSize,
            color: lightGrayColor,
        });

        // --- Page 2: Additional Details ---
        const page2 = pdfDoc.addPage([pageTicketWidth, pageTicketHeight]);
        const { width: p2W, height: p2H } = page2.getSize();
        const p2Margin = mmToPoints(8); 
        const p2ContentWidth = p2W - 2 * p2Margin;
        let p2Y = p2H - p2Margin - mmToPoints(6);

        const sectionHeaderFontSize = 13;
        const detailLabelFontSize = 9;
        const detailValueFontSize = 9;
        const detailLineHeight = detailValueFontSize + 4; 
        const sectionSpacing = mmToPoints(7);
        const itemSpacing = mmToPoints(3.5);


        const drawDetailItemPage2 = (label: string, value: string) => {
            if (p2Y < p2Margin + sectionHeaderFontSize + detailLineHeight * 2) { 
                console.warn("Not enough space on page 2 for detail:", label);
                return;
            }
            page2.drawText(label, { x: p2Margin, y: p2Y, font: helveticaBoldFont, size: detailLabelFontSize, color: blackColor });
            p2Y -= detailLineHeight;
            p2Y = drawWrappedText(page2, value, p2Margin, p2Y, p2ContentWidth, detailLineHeight, helveticaFont, detailValueFontSize, grayColor );
            p2Y -= itemSpacing; 
        };
        
        page2.drawText("Guest Information", {
            x: p2Margin, y: p2Y, font: helveticaBoldFont, size: sectionHeaderFontSize, color: primaryOrange
        });
        p2Y -= (sectionHeaderFontSize + mmToPoints(2));
        page2.drawLine({start: {x: p2Margin, y: p2Y}, end: {x: p2W - p2Margin, y:p2Y}, thickness: 0.7, color: lightGrayColor});
        p2Y -= mmToPoints(5);

        drawDetailItemPage2("Full Name:", submittedRegistration.name);
        drawDetailItemPage2("Email:", submittedRegistration.email);
        if (submittedRegistration.contactNumber) {
            drawDetailItemPage2("Contact:", submittedRegistration.contactNumber);
        }
        drawDetailItemPage2("Registered At:", new Date(submittedRegistration.registeredAt).toLocaleString());
        drawDetailItemPage2("Ticket ID:", submittedRegistration.id);
        
        p2Y -= (sectionSpacing - itemSpacing); 

         page2.drawText("Event Details", {
            x: p2Margin, y: p2Y, font: helveticaBoldFont, size: sectionHeaderFontSize, color: primaryOrange
        });
        p2Y -= (sectionHeaderFontSize + mmToPoints(2));
        page2.drawLine({start: {x: p2Margin, y: p2Y}, end: {x: p2W - p2Margin, y:p2Y}, thickness: 0.7, color: lightGrayColor});
        p2Y -= mmToPoints(5);

        drawDetailItemPage2("Event Name:", eventDetails.title);
        drawDetailItemPage2("Date & Time:", formatEventDateTimeForPdf(eventDetails.eventDate, eventDetails.eventTime));
        if (eventDetails.venueName) {
            drawDetailItemPage2("Venue Name:", eventDetails.venueName);
        }
        if (eventDetails.venueAddress) {
            drawDetailItemPage2("Venue Address:", eventDetails.venueAddress.replace(/\\n/g, ', '));
        }
        if (eventDetails.mapLink) {
            drawDetailItemPage2("Directions:", "Use map link on event page");
        }
        if (!eventDetails.venueName && !eventDetails.venueAddress && !eventDetails.mapLink) {
             drawDetailItemPage2("Location:", "Not specified");
        }


        const footerText = "Powered by evntos";
        const footerSize = 7;
        page2.drawText(footerText, {
            x: p2W / 2 - helveticaFont.widthOfTextAtSize(footerText, footerSize) / 2,
            y: p2Margin - mmToPoints(2), 
            font: helveticaFont,
            size: footerSize,
            color: lightGrayColor,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const safeEventName = eventDetails.title.replace(/[^a-zA-Z0-9\\s]/g, '').replace(/\\s+/g, '_');
        const safeGuestName = submittedRegistration.name.replace(/[^a-zA-Z0-9\\s]/g, '').replace(/\\s+/g, '_');
        link.download = \`\${safeEventName}-Ticket-\${safeGuestName}.pdf\`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        reset(); // Reset form fields
        setSubmittedRegistration(null); // Clear submitted state to show form again or a generic thank you

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
            Thank you for registering for <span className="font-semibold text-primary">"\${eventName}"</span>.<br/> 
            Your ticket has been emailed to you. You can also download it directly below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-3 pt-4 pb-6 px-6 text-center">
          <p className="text-md text-foreground"><strong className="font-medium">Name:</strong> \${submittedRegistration.name}</p>
          <p className="text-md text-foreground"><strong className="font-medium">Email:</strong> \${submittedRegistration.email}</p>
          {submittedRegistration.contactNumber && (
            <p className="text-md text-foreground"><strong className="font-medium">Contact:</strong> \${submittedRegistration.contactNumber}</p>
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
            <Button variant="outline" onClick={() => { reset(); setSubmittedRegistration(null); }} className="w-full">
                Register Another Guest
            </Button>
          </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-t-4 border-primary h-full flex flex-col">
      <CardHeader className="pb-4 text-center">
         <TicketIconLucide className="mx-auto h-12 w-12 text-primary mb-3" />
        <CardTitle className="font-headline text-2xl md:text-3xl text-primary">Register for \${eventName}</CardTitle>
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
            {\`\${errors.name ? <p className="text-sm text-destructive pt-1">\${errors.name.message}</p> : ''}\`}
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
            {\`\${errors.email ? <p className="text-sm text-destructive pt-1">\${errors.email.message}</p> : ''}\`}
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
            {\`\${errors.contactNumber ? <p className="text-sm text-destructive pt-1">\${errors.contactNumber.message}</p> : ''}\`}
          </div>
        </CardContent>
        <CardFooter className="p-6 md:p-8 mt-auto">
          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow"
            disabled={isSubmitting}
          >
            {isSubmitting && <LoadingSpinner size={20} className="mr-2" />}
            {isSubmitting ? "Registering..." : "Register & Get Ticket"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
