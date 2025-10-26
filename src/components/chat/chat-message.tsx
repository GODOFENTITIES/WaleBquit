import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatAvatar } from './chat-avatar';
import { ThinkingIndicator } from './thinking-indicator';

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';

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
        {message.content === '...' ? (
          <ThinkingIndicator />
        ) : (
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
      {message.role === 'user' && <ChatAvatar role="user" />}
    </div>
  );
}
