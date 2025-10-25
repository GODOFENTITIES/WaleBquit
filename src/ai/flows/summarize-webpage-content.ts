'use server';

/**
 * @fileOverview Summarizes the content of a webpage given a URL.
 *
 * - summarizeWebpageContent - A function that accepts a URL and returns a summary of the webpage content.
 * - SummarizeWebpageContentInput - The input type for the summarizeWebpageContent function.
 * - SummarizeWebpageContentOutput - The return type for the summarizeWebpageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {fetchWebpageContent} from '@/services/webpage-service';

const SummarizeWebpageContentInputSchema = z.object({
  url: z.string().url().describe('The URL of the webpage to summarize.'),
});
export type SummarizeWebpageContentInput = z.infer<
  typeof SummarizeWebpageContentInputSchema
>;

const SummarizeWebpageContentOutputSchema = z.object({
  summary: z.string().describe('A summary of the webpage content.'),
});
export type SummarizeWebpageContentOutput = z.infer<
  typeof SummarizeWebpageContentOutputSchema
>;

export async function summarizeWebpageContent(
  input: SummarizeWebpageContentInput
): Promise<SummarizeWebpageContentOutput> {
  return summarizeWebpageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWebpageContentPrompt',
  input: {schema: SummarizeWebpageContentInputSchema},
  output: {schema: SummarizeWebpageContentOutputSchema},
  prompt: `You are an expert summarizer.  Summarize the content of the webpage below in a concise manner.

Webpage content: {{{content}}}`,
});

const summarizeWebpageContentFlow = ai.defineFlow(
  {
    name: 'summarizeWebpageContentFlow',
    inputSchema: SummarizeWebpageContentInputSchema,
    outputSchema: SummarizeWebpageContentOutputSchema,
  },
  async input => {
    const content = await fetchWebpageContent(input.url);
    const {output} = await prompt({content: content});
    return output!;
  }
);
