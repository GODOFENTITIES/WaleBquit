'use server';

import { generateInitialTaskList } from '@/ai/flows/generate-initial-task-list';
import { summarizeWebpageContent } from '@/ai/flows/summarize-webpage-content';
import { z } from 'zod';

const urlSchema = z.string().url({ message: "Please enter a valid URL." });

function isValidUrl(text: string) {
  try {
    new URL(text);
    // Extra check for common cases where new URL() is too permissive
    return text.includes('.') && !text.startsWith('http://.') && !text.startsWith('https://.');
  } catch (_) {
    return false;
  }
}

export async function getAiResponse(prompt: string) {
  try {
    if (isValidUrl(prompt)) {
      const result = await summarizeWebpageContent({ url: prompt });
      return { success: true, data: result.summary };
    } else {
      const result = await generateInitialTaskList({ prompt });
      if (result.tasks.length === 0) {
        return { success: true, data: "I can help with a variety of tasks! For example, try asking me to 'plan a weekend trip to the mountains' or 'create a grocery list for a week'." };
      }
      const formattedTasks = result.tasks.map(task => `- ${task}`).join('\n');
      return { success: true, data: formattedTasks };
    }
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Sorry, I couldn't process that. Error: ${errorMessage}` };
  }
}
