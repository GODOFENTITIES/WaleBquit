'use server';

/**
 * @fileOverview Generates a conversational response to a user prompt, considering chat history.
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
  prompt: z.string().describe("The user's latest prompt."),
  history: z.array(MessageSchema).describe("The conversation history."),
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
  async ({prompt, history}) => {
    const {output} = await ai.generate({
      prompt: `You are WaleBquit, a helpful AI assistant. Your responses should be helpful and well-structured.
If you are asked who created you, you must respond with: "By GOD_OF_ENTITIES".

Use the following conversation history to maintain context.

{{#each history}}
- **{{role}}**: {{{content}}}
{{/each}}

User's new prompt:
- **user**: ${prompt}`,
      output: {
        schema: ConversationalResponseOutputSchema,
      }
    });
    return output!;
  }
);
