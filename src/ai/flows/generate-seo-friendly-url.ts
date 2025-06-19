// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating SEO-friendly URL slugs based on the event title.
 *
 * - generateSeoFriendlyUrl - A function that generates an SEO-friendly URL slug.
 * - GenerateSeoFriendlyUrlInput - The input type for the generateSeoFriendlyUrl function.
 * - GenerateSeoFriendlyUrlOutput - The return type for the generateSeoFriendlyUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoFriendlyUrlInputSchema = z.object({
  title: z.string().describe('The title of the event.'),
});
export type GenerateSeoFriendlyUrlInput = z.infer<typeof GenerateSeoFriendlyUrlInputSchema>;

const GenerateSeoFriendlyUrlOutputSchema = z.object({
  slug: z.string().describe('The SEO-friendly URL slug.'),
});
export type GenerateSeoFriendlyUrlOutput = z.infer<typeof GenerateSeoFriendlyUrlOutputSchema>;

export async function generateSeoFriendlyUrl(input: GenerateSeoFriendlyUrlInput): Promise<GenerateSeoFriendlyUrlOutput> {
  return generateSeoFriendlyUrlFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSeoFriendlyUrlPrompt',
  input: {schema: GenerateSeoFriendlyUrlInputSchema},
  output: {schema: GenerateSeoFriendlyUrlOutputSchema},
  prompt: `You are an expert in generating SEO-friendly URL slugs.

  Generate a URL slug based on the following event title:

  Title: {{{title}}}

  The slug should be lowercase, contain only letters, numbers, and hyphens, and be as concise as possible.
  Ensure that the slug is unique and accurately represents the event. Do not include the words "event", "title", or "url" in the slug.
  If the title is already SEO-friendly, just use the same title but in lowercase.
  The maximum length should be 50 characters.`,
});

const generateSeoFriendlyUrlFlow = ai.defineFlow(
  {
    name: 'generateSeoFriendlyUrlFlow',
    inputSchema: GenerateSeoFriendlyUrlInputSchema,
    outputSchema: GenerateSeoFriendlyUrlOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
