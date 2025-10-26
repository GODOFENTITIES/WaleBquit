'use server';

/**
 * @fileOverview Generates a concise title for a new chat session based on the user's initial prompt.
 *
 * - generateChatTitle - A function that generates a title for a chat session.
 * - GenerateChatTitleInput - The input type for the generateChatTitle function.
 * - GenerateChatTitleOutput - The return type for the generateChatTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatTitleInputSchema = z.object({
  prompt: z.string().describe("The user's initial prompt."),
});
export type GenerateChatTitleInput = z.infer<typeof GenerateChatTitleInputSchema>;

const GenerateChatTitleOutputSchema = z.object({
  title: z
    .string()
    .describe('A short, concise title (3-5 words) for the chat session.'),
});
export type GenerateChatTitleOutput = z.infer<typeof GenerateChatTitleOutputSchema>;

export async function generateChatTitle(
  input: GenerateChatTitleInput
): Promise<GenerateChatTitleOutput> {
  return generateChatTitleFlow(input);
}

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: GenerateChatTitleInputSchema,
    outputSchema: GenerateChatTitleOutputSchema,
  },
  async ({prompt}) => {
    const {output} = await ai.generate({
      prompt: `Generate a short, concise title (3-5 words) for a chat session that starts with the following user prompt.

User Prompt:
---
${prompt}
---

Title:`,
      output: {
        schema: GenerateChatTitleOutputSchema,
      },
      config: {
        temperature: 0.3,
      }
    });

    return output!;
  }
);
