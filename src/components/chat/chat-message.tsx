import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatAvatar } from './chat-avatar';
import { ThinkingIndicator } from './thinking-indicator';
import { useTypewriter } from '@/hooks/use-typewriter';
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  isResponding?: boolean;
  onContentChange?: () => void;
}

export function ChatMessage({ message, isResponding, onContentChange }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isThinking = message.content === '...';
  const useTypewriterEffect = isAssistant && !isThinking && isResponding;

  const displayText = useTypewriter(message.content, useTypewriterEffect);

  useEffect(() => {
    if (useTypewriterEffect) {
      onContentChange?.();
    }
  }, [displayText, useTypewriterEffect, onContentChange]);

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
        {isThinking ? (
          <ThinkingIndicator />
        ) : (
          <div className="prose prose-sm prose-neutral dark:prose-invert prose-p:leading-relaxed prose-p:m-0">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p {...props} />,
              }}
            >
              {displayText}
            </ReactMarkdown>
          </div>
        )}
      </div>
      {message.role === 'user' && <ChatAvatar role="user" />}
    </div>
  );
}
