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
  prompt: z.string().describe("The user's prompt."),
});
export type ConversationalResponseInput = z.infer<typeof ConversationalResponseInputSchema>;

const ConversationalResponseOutputSchema = z.object({
  response: z.string().describe("The AI's conversational response."),
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
  prompt: `You are WaleBquit, a friendly and highly intelligent AI assistant. Your purpose is to engage in natural, helpful, and well-structured conversations.

Please provide a comprehensive, friendly, and well-structured response to the following user prompt.
- Your language must be clear, grammatically flawless, and easy to understand.
- Adhere strictly to proper dictionary definitions and sentence structures.
- If a question is complex, break down the answer into smaller, digestible points or steps.
- Maintain a positive and encouraging tone.
- When appropriate, use lists or formatting to improve readability.

User's prompt:
{{{prompt}}}`,
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
