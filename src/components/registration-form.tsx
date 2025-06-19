
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
import { Download, Phone, CheckCircle, User, Mail, Ticket as TicketIconLucide } from 'lucide-react'; // Renamed Ticket to avoid conflict
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

// Helper function to convert HSL string to HEX string
function hslToHex(hsl: string): string {
  const hslMatch = hsl.match(/hsl\((\d+)\s*[,]?\s*(\d+)%\s*[,]?\s*(\d+)%\)/i) || hsl.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/i);
  if (!hslMatch) {
    console.warn(`Invalid HSL string: ${hsl}. Defaulting to black.`);
    return '#000000'; 
  }

  let h = parseInt(hslMatch[1]);
  let s = parseInt(hslMatch[2]);
  let l = parseInt(hslMatch[3]);

  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const toHexComponent = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const r = toHexComponent(f(0));
  const g = toHexComponent(f(8));
  const b = toHexComponent(f(4));

  return `#${r}${g}${b}`;
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
         // If we are at max lines and there are more words, add ellipsis to the current line
        if (n < words.length) {
            let lastLine = ctx.measureText(line.trim() + '...').width > maxWidth ? line.substring(0, line.length - 2).trim() + '...' : line.trim() + '...';
            // Need to clear the previous line before drawing the truncated one
            // This is complex as it requires knowing the previous line's exact y.
            // Simplified: just draw the (potentially truncated) last line.
            // This part of ellipsis for wrapped text is tricky. The current logic adds ellipsis if the *next* word makes it overflow.
            // Let's ensure the current line gets ellipsis if it's the last allowed line and there's more text.
            let tempLine = line.trim();
            if (ctx.measureText(tempLine).width > maxWidth) { // if current line itself is too long
                 while(ctx.measureText(tempLine + "...").width > maxWidth && tempLine.length > 0) {
                    tempLine = tempLine.slice(0, -1);
                 }
                 tempLine += "...";
            } else if (n < words.length -1 && linesDrawn === maxLines -1) { // last allowed line and more words
                 tempLine += "...";
                 while(ctx.measureText(tempLine).width > maxWidth && tempLine.length > 3) { // 3 for "..."
                    tempLine = tempLine.slice(0, -4) + "..."; // remove char before "..."
                 }
            }
            ctx.fillText(tempLine, x, currentY - lineHeight); // Redraw previous line with ellipsis if needed
            ctx.fillText(tempLine, x, currentY);

        }
        break; 
      }
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = testLine.trim() === words[n] && metrics.width > maxWidth ? maxWidth : metrics.width; // Handle single very long word

      if (testWidth > maxWidth && n > 0) {
        let textToDraw = line.trim();
        if (linesDrawn === maxLines - 1 && n < words.length -1 ) { // If this is the last allowed line and there are more words
            while(ctx.measureText(textToDraw + "...").width > maxWidth && textToDraw.length > 0) {
                textToDraw = textToDraw.slice(0, -1);
            }
            textToDraw += "...";
        }
        ctx.fillText(textToDraw, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesDrawn++;
      } else {
        line = testLine;
      }
    }
    // Draw the last line
    if (!(maxLines && linesDrawn >= maxLines)) {
        let finalText = line.trim();
        if (linesDrawn === maxLines -1 && line.length > 0 && words.length > 0 && ctx.measureText(finalText).width > maxWidth){
             while(ctx.measureText(finalText + "...").width > maxWidth && finalText.length > 0) {
                finalText = finalText.slice(0, -1);
            }
            finalText += "...";
        }
       ctx.fillText(finalText, x, currentY);
    }
    return currentY + lineHeight; // Return Y for the next line
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
    const dpi = 300; // Good resolution for print
    const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

    canvas.width = mmToPx(pdfTicketWidthMm);
    canvas.height = mmToPx(pdfTicketHeightMm);

    // Get theme colors
    const rootStyle = getComputedStyle(document.documentElement);
    const primaryHslRaw = rootStyle.getPropertyValue('--primary').trim();
    const primaryHex = hslToHex(`hsl(${primaryHslRaw})`);
    
    const primaryFgHslRaw = rootStyle.getPropertyValue('--primary-foreground').trim();
    const primaryFgHex = hslToHex(`hsl(${primaryFgHslRaw})`);

    const cardHslRaw = rootStyle.getPropertyValue('--card').trim();
    const cardHex = hslToHex(`hsl(${cardHslRaw})`);

    const textHslRaw = rootStyle.getPropertyValue('--card-foreground').trim();
    const textHex = hslToHex(`hsl(${textHslRaw})`);
    
    const mutedTextHslRaw = rootStyle.getPropertyValue('--muted-foreground').trim();
    const mutedTextHex = hslToHex(`hsl(${mutedTextHslRaw})`);

    const borderHslRaw = rootStyle.getPropertyValue('--border').trim();
    const borderHex = hslToHex(`hsl(${borderHslRaw})`);

    // --- Drawing Start ---

    // 1. Background
    ctx.fillStyle = cardHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Border
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = mmToPx(0.3);
    ctx.strokeRect(mmToPx(2), mmToPx(2), canvas.width - mmToPx(4), canvas.height - mmToPx(4));

    const contentPadding = mmToPx(5);
    const contentWidth = canvas.width - 2 * contentPadding;
    let currentY = contentPadding;

    // 3. Header Section (Event Title)
    const headerHeight = mmToPx(22);
    ctx.fillStyle = primaryHex;
    ctx.fillRect(contentPadding, currentY, contentWidth, headerHeight);

    ctx.fillStyle = primaryFgHex;
    ctx.font = `bold ${mmToPx(5.5)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    const eventTitleText = `🎟️ ${eventName}`; // Unicode ticket emoji
    // Vertically align text in header
    const eventTitleMetrics = ctx.measureText("M"); // Approximate height
    const eventTitleActualHeight = eventTitleMetrics.actualBoundingBoxAscent + eventTitleMetrics.actualBoundingBoxDescent || mmToPx(5.5);
    drawTextWithWrapping(ctx, eventTitleText, canvas.width / 2, currentY + (headerHeight / 2) + (eventTitleActualHeight / 3) , contentWidth - mmToPx(6), mmToPx(6.5), 2);
    currentY += headerHeight + mmToPx(8);

    // 4. "GUEST TICKET" Sub-header
    ctx.fillStyle = textHex;
    ctx.font = `bold ${mmToPx(4.5)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText("GUEST TICKET", canvas.width / 2, currentY);
    currentY += mmToPx(10);

    // 5. Guest Details Section
    ctx.textAlign = 'left';
    const detailIndent = contentPadding + mmToPx(3);
    
    const drawDetailItemPremium = (icon: string, labelText: string, valueText: string) => {
        const iconSize = mmToPx(4.5);
        const textStartX = detailIndent + iconSize + mmToPx(3); // Start X for text after icon
        const availableTextWidth = contentWidth - (iconSize + mmToPx(5)); // Width for label and value

        // Icon (Emoji)
        ctx.font = `${iconSize}px Inter, sans-serif`;
        ctx.fillStyle = primaryHex; // Use primary color for icons
        // Adjust Y for emoji baseline alignment - this is approximate
        const iconMetrics = ctx.measureText(icon);
        const iconActualHeight = iconMetrics.actualBoundingBoxAscent + iconMetrics.actualBoundingBoxDescent || iconSize;
        ctx.fillText(icon, detailIndent, currentY + iconActualHeight * 0.7); 

        // Label
        ctx.font = `bold ${mmToPx(3.5)}px Inter, sans-serif`;
        ctx.fillStyle = mutedTextHex; // Muted color for labels
        ctx.fillText(labelText, textStartX, currentY);
        currentY += mmToPx(4.5); // Line height for label

        // Value
        ctx.font = `normal ${mmToPx(4)}px Inter, sans-serif`;
        ctx.fillStyle = textHex; // Standard text color for values
        currentY = drawTextWithWrapping(ctx, valueText, textStartX, currentY, availableTextWidth, mmToPx(5), 2); // Max 2 lines for value
        currentY += mmToPx(5); // Space after each item
    };

    drawDetailItemPremium("👤", "Guest Name:", submittedRegistration.name); // User emoji
    drawDetailItemPremium("📧", "Email Address:", submittedRegistration.email); // Email emoji
    if (submittedRegistration.contactNumber) {
      drawDetailItemPremium("📞", "Contact:", submittedRegistration.contactNumber); // Phone emoji
    }
    currentY += mmToPx(3); 

    // 6. QR Code
    const qrSizePx = mmToPx(40);
    const qrX = (canvas.width - qrSizePx) / 2;
    const qrY = Math.min(currentY, canvas.height - contentPadding - qrSizePx - mmToPx(15)); // Ensure QR fits before instructions

    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, qrX, qrY, qrSizePx, qrSizePx);
      let postQrY = qrY + qrSizePx + mmToPx(7);

      // 7. Instructions
      ctx.fillStyle = mutedTextHex;
      ctx.font = `italic ${mmToPx(3.5)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      postQrY = drawTextWithWrapping(ctx, "Present this QR code at the event entrance for verification.", canvas.width / 2, postQrY, contentWidth - mmToPx(4), mmToPx(4.5), 2);
      
      // 8. Footer Branding - Positioned at the very bottom
      const footerY = canvas.height - contentPadding + mmToPx(1);
      ctx.font = `normal ${mmToPx(3)}px Inter, sans-serif`;
      ctx.fillStyle = mutedTextHex;
      // Ensure branding doesn't overlap with instructions if content is tall
      if (postQrY < footerY - mmToPx(5)) {
         ctx.fillText("Powered by Eventos", canvas.width / 2, footerY);
      } else { // If not enough space, draw it just below instructions
         ctx.fillText("Powered by Eventos", canvas.width / 2, postQrY + mmToPx(4));
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
          width: 400, 
          margin: 1, 
          type: 'image/png',
          color: {
            dark: primaryHex, 
            light: '#00000000' // Transparent background for QR
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

