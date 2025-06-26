
'use server';
/**
 * @fileOverview A Genkit flow to send a welcome email to new users.
 *
 * - sendWelcomeEmail - Sends a welcome email.
 * - SendWelcomeEmailInput - Input schema for the flow.
 * - SendWelcomeEmailOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const SendWelcomeEmailInputSchema = z.object({
  userName: z.string().optional().describe("The name of the new user."),
  userEmail: z.string().email().describe("The email address of the new user."),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

const SendWelcomeEmailOutputSchema = z.object({
  success: z.boolean().describe("Whether the email was sent successfully."),
  message: z.string().describe("A message indicating the outcome."),
  emailId: z.string().optional().describe("The ID of the sent email, if successful."),
});
export type SendWelcomeEmailOutput = z.infer<typeof SendWelcomeEmailOutputSchema>;

export async function sendWelcomeEmail(input: SendWelcomeEmailInput): Promise<SendWelcomeEmailOutput> {
  return sendWelcomeEmailFlow(input);
}

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: SendWelcomeEmailInputSchema,
    outputSchema: SendWelcomeEmailOutputSchema,
  },
  async (input) => {
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        // Log the error on the server for debugging
        console.error("RESEND_API_KEY environment variable is not configured for welcome email.");
        // Return a clear error message to the client
        return { success: false, message: "Welcome email service is not configured on the server." };
      }

      const resend = new Resend(resendApiKey);
      const fromEmail = 'Evntos Welcome <welcome@evntosupdates.oursblogs24.com>'; 
      const userName = input.userName || 'New User';
      const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'; // Fallback for local dev

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [input.userEmail],
        subject: 'Welcome to Evntos!',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h1 style="color: #F97316;">Welcome to Evntos, ${userName}!</h1>
            <p>Thank you for signing up. We're excited to have you on board.</p>
            <p>With Evntos, you can easily create, promote, and manage your events. Get ready to make your next event a stunning success!</p>
            <p>To get started, please visit your dashboard:</p>
            <p><a href="${appBaseUrl}/dashboard" style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
            <br/>
            <p>If you have any questions, feel free to explore our <a href="${appBaseUrl}/#faq">FAQ section</a> or contact our support team.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Evntos Team</strong></p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend API Error (welcome email):", error);
        return { success: false, message: `Failed to send welcome email: ${error.message}` };
      }

      return { success: true, message: "Welcome email sent successfully.", emailId: data?.id };

    } catch (e: any) {
      console.error("Error in sendWelcomeEmailFlow (outer catch):", e);
      // This allows the client to know an unexpected error occurred, while the server logs have the details.
      return { success: false, message: e.message || 'An unexpected server error occurred.' };
    }
  }
);
