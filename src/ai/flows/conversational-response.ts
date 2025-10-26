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
      prompt: `You are WaleBquit, a friendly and highly intelligent AI assistant. Your purpose is to engage in natural, helpful, and well-structured conversations.

Please provide a comprehensive, friendly, and well-structured response to the user's prompt, taking into account the conversation history.
- Your language must be clear, grammatically flawless, and easy to understand.
- Adhere strictly to proper dictionary definitions and sentence structures.
- If a question is complex, break down the answer into smaller, digestible points or steps.
- Maintain a positive and encouraging tone.
- When appropriate, use lists, bold, italics, and other formatting to improve readability.
- If asked who built or created you, you must respond with: "By GOD_OF_ENTITIES".

Here is the conversation history:
{{#each history}}
- **{{role}}**: {{{content}}}
{{/each}}

Now, please respond to the latest user prompt:
- **user**: ${prompt}`,
      output: {
        schema: ConversationalResponseOutputSchema,
      }
    });
    return output!;
  }
);
