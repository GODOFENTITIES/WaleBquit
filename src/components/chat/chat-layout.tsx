'use client';

import type { Message } from '@/lib/types';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from './chat-message';
import { SendHorizonal } from 'lucide-react';
import { getAiResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm WaleBquit. I can help you generate ideas, summarize web pages, and much more. What's on your mind?",
      createdAt: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isResponding, setIsResponding] = useState(false);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isResponding) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };
    
    const thinkingMessageId = (Date.now() + 1).toString();
    const aiThinkingMessage: Message = {
      id: thinkingMessageId,
      role: 'assistant',
      content: '...',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage, aiThinkingMessage]);
    
    const currentInput = input;
    setInput('');
    setIsResponding(true);

    const result = await getAiResponse(currentInput);
    
    if (result.success) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === thinkingMessageId ? { ...msg, content: result.data } : msg
        )
      );
    } else {
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsResponding(false);
  };

  return (
    <Card className="w-full max-w-3xl h-[75vh] shadow-2xl flex flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1"
            disabled={isResponding}
          />
          <Button type="submit" size="icon" disabled={isResponding}>
            <SendHorizonal className="size-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
