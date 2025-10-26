'use server';

/**
 * @fileOverview Generates a conversational response to a user prompt, considering conversation history.
 *
 * - generateConversationalResponse - A function that generates a conversational response.
 * - ConversationalResponseInput - The input type for the generateConversationalResponse function.
 * - ConversationalResponseOutput - The return type for the generateConversationalResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ConversationalResponseInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe("The user's latest prompt."),
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

const conversationalResponseFlow = ai.defineFlow(
  {
    name: 'conversationalResponseFlow',
    inputSchema: ConversationalResponseInputSchema,
    outputSchema: ConversationalResponseOutputSchema,
  },
  async ({history, prompt}) => {
    const {output} = await ai.generate({
      prompt: `You are WaleBquit, a friendly and highly intelligent AI assistant. Your purpose is to engage in natural, helpful, and well-structured conversations.

Please provide a comprehensive, friendly, and well-structured response to the following user prompt.
- Your language must be clear, grammatically flawless, and easy to understand.
- Adhere strictly to proper dictionary definitions and sentence structures.
- If a question is complex, break down the answer into smaller, digestible points or steps.
- Maintain a positive and encouraging tone.
- When appropriate, use lists or formatting to improve readability.

User's prompt:
{{{prompt}}}`,
      history: history.map(h => ({role: h.role, content: h.content})),
    });
    return output!;
  }
);
