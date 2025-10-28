'use client';

import type { Message } from '@/lib/types';
import { FormEvent, useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from './chat-message';
import { SendHorizonal } from 'lucide-react';
import { getAiResponse, getTitleForSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useChatHistory } from '@/hooks/chat-history-provider';
import { Logo } from '../logo';
import { AnimatedTitle } from './animated-title';

export function ChatLayout() {
  const { 
    activeSession, 
    activeSessionId, 
    addMessageToSession, 
    updateMessageInSession,
    removeMessageFromSession,
    updateSessionTitle,
  } = useChatHistory();
  
  const [input, setInput] = useState('');
  const { toast } = useToast();
  const [isResponding, setIsResponding] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  useEffect(() => {
    if (isResponding) {
      scrollToBottom();
    }
  }, [activeSession?.messages, isResponding]);
  
  useEffect(() => {
    if (!isResponding) {
      inputRef.current?.focus();
    }
  }, [isResponding, activeSessionId]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isResponding || !activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    addMessageToSession(activeSessionId, userMessage);
    
    // Check if this is the first user message to set the title
    if (activeSession?.messages.filter(m => m.role === 'user').length === 0) {
      getTitleForSession(input).then(result => {
        if(result.success && activeSessionId) {
          updateSessionTitle(activeSessionId, result.data);
        }
      });
    }

    const thinkingMessageId = (Date.now() + 1).toString();
    const aiThinkingMessage: Message = {
      id: thinkingMessageId,
      role: 'assistant',
      content: '...',
      createdAt: new Date(),
    };
    addMessageToSession(activeSessionId, aiThinkingMessage);
    
    const currentInput = input;
    setInput('');
    setIsResponding(true);

    // Construct the history AFTER adding the new user message.
    const currentHistory = activeSession?.messages.map(({ id, createdAt, ...rest }) => rest) || [];
    
    const result = await getAiResponse(currentInput, currentHistory);
    
    if (result.success && activeSessionId) {
      updateMessageInSession(activeSessionId, thinkingMessageId, result.data);
    } else {
      if(activeSessionId) {
        removeMessageFromSession(activeSessionId, thinkingMessageId);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsResponding(false);
  }, [input, isResponding, activeSessionId, activeSession, addMessageToSession, updateSessionTitle, updateMessageInSession, removeMessageFromSession, toast]);
  
  if (!activeSession) {
    return (
      <div className="w-full max-w-3xl h-full flex items-center justify-center">
         <div className="flex flex-col items-center text-center">
            <Logo />
            <AnimatedTitle text="WaleBquit" />
            <p className="text-muted-foreground">Start a conversation to see what I can do.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-3xl h-full flex flex-col">
       <Card className="w-full h-full shadow-2xl flex flex-col">
        <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div className="p-4 space-y-4">
            {activeSession.messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isResponding={isResponding && message.id === activeSession.messages[activeSession.messages.length - 1].id}
                onContentChange={scrollToBottom}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              ref={inputRef}
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
    </div>
  );
}
