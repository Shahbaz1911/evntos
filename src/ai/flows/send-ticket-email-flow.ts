
'use server';
/**
 * @fileOverview A Genkit flow to generate a PDF ticket with a QR code and email it to the user.
 *
 * - sendTicketEmail - Generates and emails a PDF ticket.
 * - SendTicketEmailInput - Input schema for the flow.
 * - SendTicketEmailOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { toBuffer as QRCodeToBuffer } from 'qrcode';
import { Resend } from 'resend';
// import { streamToBuffer } from '@jorgeferrero/stream-to-buffer'; // Not strictly needed as pdfDoc.save() returns Uint8Array
import type { Event } from '@/types'; // Assuming Event type is available

// Helper function from registration-form, slightly adapted
const formatEventDateTimeForPdf = (dateStr?: string, timeStr?: string) => {
  if (!dateStr || dateStr.trim() === "" || !timeStr || timeStr.trim() === "") {
    return "N/A";
  }
  try {
    const dateTime = new Date(`${dateStr.trim()}T${timeStr.trim()}:00`);
    if (isNaN(dateTime.getTime())) return "Invalid Date/Time";
    
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return `${dateTime.toLocaleDateString(undefined, dateOptions)}, ${dateTime.toLocaleTimeString(undefined, timeOptions)}`;
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


const SendTicketEmailInputSchema = z.object({
  registrationId: z.string().describe("The unique ID of the registration."),
  userName: z.string().describe("The name of the registered user."),
  userEmail: z.string().email().describe("The email address of the registered user."),
  eventDetails: z.object({
    title: z.string(),
    eventDate: z.string().optional(),
    eventTime: z.string().optional(),
    venueName: z.string().optional(),
    venueAddress: z.string().optional(),
    mapLink: z.string().optional(),
  }).describe("Details of the event for which the ticket is being generated.")
});
export type SendTicketEmailInput = z.infer<typeof SendTicketEmailInputSchema>;

const SendTicketEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  message: z.string().describe("A message indicating the outcome."),
  emailId: z.string().optional().describe("The ID of the sent email, if successful."),
});
export type SendTicketEmailOutput = z.infer<typeof SendTicketEmailOutputSchema>;


async function generatePdfTicket(input: SendTicketEmailInput): Promise<Uint8Array> {
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
    
    const eventTitleText = input.eventDetails.title;
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

    const qrImageBuffer = await QRCodeToBuffer(input.registrationId, {
        errorCorrectionLevel: 'H', width: 350, margin: 1, type: 'image/png',
        color: { dark: '#000000', light: '#FFFFFF' }
    });
    const qrImage = await pdfDoc.embedPng(qrImageBuffer);
    const qrDisplaySize = mmToPoints(40); 
    page1.drawImage(qrImage, {
        x: p1W / 2 - qrDisplaySize / 2,
        y: p1Y - qrDisplaySize,
        width: qrDisplaySize,
        height: qrDisplaySize,
    });
    p1Y -= (qrDisplaySize + mmToPoints(4));

    const nameText = input.userName;
    const nameSize = 12;
    const nameLineHeight = nameSize + 3;
    p1Y = drawWrappedText(page1, nameText, p1Margin, p1Y, p1ContentWidth, nameLineHeight, helveticaBoldFont, nameSize, blackColor, {textAlign: 'center'});
    p1Y -= mmToPoints(3);
    
    const ticketIdText = `Ticket ID: ${input.registrationId}`;
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

    drawDetailItemPage2("Full Name:", input.userName);
    drawDetailItemPage2("Email:", input.userEmail);
    // Assuming contactNumber is not passed for now, or make it optional in input schema
    drawDetailItemPage2("Ticket ID:", input.registrationId);
    
    p2Y -= (sectionSpacing - itemSpacing); 

     page2.drawText("Event Details", {
        x: p2Margin, y: p2Y, font: helveticaBoldFont, size: sectionHeaderFontSize, color: primaryOrange
    });
    p2Y -= (sectionHeaderFontSize + mmToPoints(2));
    page2.drawLine({start: {x: p2Margin, y: p2Y}, end: {x: p2W - p2Margin, y:p2Y}, thickness: 0.7, color: lightGrayColor});
    p2Y -= mmToPoints(5);

    drawDetailItemPage2("Event Name:", input.eventDetails.title);
    drawDetailItemPage2("Date & Time:", formatEventDateTimeForPdf(input.eventDetails.eventDate, input.eventDetails.eventTime));
    if (input.eventDetails.venueName) {
        drawDetailItemPage2("Venue Name:", input.eventDetails.venueName);
    }
    if (input.eventDetails.venueAddress) {
        drawDetailItemPage2("Venue Address:", input.eventDetails.venueAddress.replace(/\\n/g, ', '));
    }
    if (input.eventDetails.mapLink) {
        drawDetailItemPage2("Map Link:", input.eventDetails.mapLink);
    }
    if (!input.eventDetails.venueName && !input.eventDetails.venueAddress && !input.eventDetails.mapLink) {
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
    
    return pdfDoc.save();
}


export async function sendTicketEmail(input: SendTicketEmailInput): Promise<SendTicketEmailOutput> {
  return sendTicketEmailFlow(input);
}

const sendTicketEmailFlow = ai.defineFlow(
  {
    name: 'sendTicketEmailFlow',
    inputSchema: SendTicketEmailInputSchema,
    outputSchema: SendTicketEmailOutputSchema,
  },
  async (input) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Resend API key is not configured.");
      return { success: false, message: "Email sending is not configured on the server." };
    }

    const resend = new Resend(resendApiKey);

    try {
      const pdfBytes = await generatePdfTicket(input); // Uint8Array
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64'); // Convert to Base64 string

      const safeEventName = input.eventDetails.title.replace(/[^a-zA-Z0-9\\s]/g, '').replace(/\\s+/g, '_');
      const safeGuestName = input.userName.replace(/[^a-zA-Z0-9\\s]/g, '').replace(/\\s+/g, '_');
      const filename = `${safeEventName}-Ticket-${safeGuestName}.pdf`;

      const fromEmail = 'Evntos Tickets <tickets@evntosupdates.oursblogs24.com>'; 

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [input.userEmail],
        subject: `Your Ticket for ${input.eventDetails.title}`,
        html: `
          <h1>Hello ${input.userName},</h1>
          <p>Thank you for registering for <strong>${input.eventDetails.title}</strong>!</p>
          <p>Your PDF ticket is attached to this email. Please bring it with you (either printed or on your device) for entry to the event.</p>
          <p>We look forward to seeing you there!</p>
          <br/>
          <p>Best regards,</p>
          <p>The Evntos Team</p>
        `,
        attachments: [
          {
            filename: filename,
            content: pdfBase64, // Use Base64 encoded string
          },
        ],
      });

      if (error) {
        console.error("Resend API Error (full object):", error); 
        let displayMessage = "An unknown Resend API error occurred."; 
        if (typeof error === 'string' && error.trim() !== "") {
          displayMessage = error;
        } else if (error && typeof error === 'object') {
          if (typeof (error as any).message === 'string' && (error as any).message.trim() !== "") {
            displayMessage = (error as any).message;
          } else if (typeof (error as any).name === 'string' && (error as any).name.trim() !== "") {
            displayMessage = (error as any).name.toLowerCase().includes("error") ? (error as any).name : `Error: ${(error as any).name}`;
          } else if (Object.keys(error).length > 0) {
            displayMessage = `Resend API Error: ${JSON.stringify(error)}. Check server logs.`;
          }
        }
        return { success: false, message: `Failed to send email. Reason: ${displayMessage} Please check server logs for complete details.` };
      }

      return { success: true, message: "Ticket email sent successfully.", emailId: data?.id };

    } catch (e: any) {
      console.error("Error in sendTicketEmailFlow (outer catch):", e);
      let displayMessage = "An unexpected error occurred processing your request.";
      if (typeof e === 'string' && e.trim() !== "") {
        displayMessage = e;
      } else if (e && typeof e === 'object') {
        if (typeof e.message === 'string' && e.message.trim() !== "") {
            displayMessage = e.message;
          } else if (typeof e.name === 'string' && e.name.trim() !== "") {
            displayMessage = e.name.toLowerCase().includes("error") ? e.name : `Error: ${e.name}`;
          }
      }
      return { success: false, message: `${displayMessage} Please check server logs.` };
    }
  }
);
    

    