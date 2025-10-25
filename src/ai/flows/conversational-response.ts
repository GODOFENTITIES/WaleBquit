'use server';

/**
 * @fileOverview Generates a conversational response to a user prompt.
 *
 * - generateConversationalResponse - A function that generates a conversational response.
 * - ConversationalResponseInput - The input type for the generateConversationalResponse function.
 * - ConversationalResponseOutput - The return type for the generateConversationalResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConversationalResponseInputSchema = z.object({
  prompt: z.string().describe('The user\'s prompt.'),
});
export type ConversationalResponseInput = z.infer<typeof ConversationalResponseInputSchema>;

const ConversationalResponseOutputSchema = z.object({
  response: z.string().describe('The AI\'s conversational response.'),
});
export type ConversationalResponseOutput = z.infer<typeof ConversationalResponseOutputSchema>;

export async function generateConversationalResponse(
  input: ConversationalResponseInput
): Promise<ConversationalResponseOutput> {
  return conversationalResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalResponsePrompt',
  input: {schema: ConversationalResponseInputSchema},
  output: {schema: ConversationalResponseOutputSchema},
  prompt: `You are a helpful AI assistant called WaleBquit. Your goal is to provide helpful and friendly responses to user prompts.

  Respond to the following prompt: {{{prompt}}}`,
});

const conversationalResponseFlow = ai.defineFlow(
  {
    name: 'conversationalResponseFlow',
    inputSchema: ConversationalResponseInputSchema,
    outputSchema: ConversationalResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
