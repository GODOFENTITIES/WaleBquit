import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatAvatar } from './chat-avatar';
import { ThinkingIndicator } from './thinking-indicator';
import { useTypewriter } from '@/hooks/use-typewriter';
import React from 'react';

function formatContent(content: string) {
  // Process newlines first
  const lines = content.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, lineIndex) => {
        if (line.trim().startsWith('- ')) {
          return (
            <ul key={lineIndex} className="space-y-1 pl-4">
              {lines.filter(l => l.trim().startsWith('- ')).map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>{formatInline(item.replace(/^- /, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (lines.some(l => l.trim().startsWith('- '))) {
          return null;
        }
        return (
          <p key={lineIndex} className="leading-relaxed whitespace-pre-wrap">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}


function formatInline(text: string): React.ReactNode {
  // Regex to find **bold** and *italic* text
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}


export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';
  const displayText = useTypewriter(message.content, isAssistant && message.content !== '...');

  return (
    <div
      className={cn(
        'flex items-start gap-3 animate-in fade-in',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {isAssistant && <ChatAvatar role="assistant" />}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-3 px-4',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card border rounded-bl-none'
        )}
      >
        {message.content === '...' ? <ThinkingIndicator /> : formatContent(displayText)}
      </div>
      {message.role === 'user' && <ChatAvatar role="user" />}
    </div>
  );
}
