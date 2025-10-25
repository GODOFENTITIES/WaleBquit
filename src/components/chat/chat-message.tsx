import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChatAvatar } from './chat-avatar';
import { ThinkingIndicator } from './thinking-indicator';

function formatContent(content: string) {
    if (content.includes('- ')) {
        return (
            <ul className="space-y-1">
                {content.split('\n').map((line, i) => (
                    <li key={i} className="flex items-start">
                        <span className="mr-2 mt-1">•</span>
                        <span>{line.replace(/^- /, '')}</span>
                    </li>
                ))}
            </ul>
        );
    }
    return <p className="leading-relaxed">{content}</p>;
}

export function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 animate-in fade-in',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && <ChatAvatar role="assistant" />}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-3 px-4',
          message.role === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card border rounded-bl-none'
        )}
      >
        {message.content === '...' ? <ThinkingIndicator /> : formatContent(message.content)}
      </div>
      {message.role === 'user' && <ChatAvatar role="user" />}
    </div>
  );
}
