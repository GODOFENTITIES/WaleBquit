'use server';

import { generateConversationalResponse } from '@/ai/flows/conversational-response';
import { summarizeWebpageContent } from '@/ai/flows/summarize-webpage-content';
import type { Message } from '@/lib/types';

function isValidUrl(text: string) {
  try {
    new URL(text);
    // Extra check for common cases where new URL() is too permissive
    return text.includes('.') && !text.startsWith('http://.') && !text.startsWith('https://.');
  } catch (_) {
    return false;
  }
}

export async function getAiResponse(prompt: string, history: Message[]) {
  try {
    if (isValidUrl(prompt)) {
      const result = await summarizeWebpageContent({ url: prompt });
      return { success: true, data: result.summary };
    } else {
      const result = await generateConversationalResponse({ 
        prompt, 
        history: history.map(h => ({role: h.role, content: h.content})) 
      });
      return { success: true, data: result.response };
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Sorry, I couldn't process that. Error: ${errorMessage}` };
  }
}
