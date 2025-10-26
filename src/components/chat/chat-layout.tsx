'use client';

import type { Message } from '@/lib/types';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { ChatMessage } from './chat-message';
import { SendHorizonal } from 'lucide-react';
import { getAiResponse, getTitleForSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useChatHistory } from '@/hooks/use-chat-history';
import { Logo } from '../logo';

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

  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isResponding || !activeSessionId) return;
    
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

    addMessageToSession(activeSessionId, userMessage);
    
    // Check if this is the first user message to set the title
    if (activeSession?.messages.filter(m => m.role === 'user').length === 0) {
      getTitleForSession(input).then(result => {
        if(result.success && activeSessionId) {
          updateSessionTitle(activeSessionId, result.data);
        }
      });
    }

    addMessageToSession(activeSessionId, aiThinkingMessage);
    
    const currentInput = input;
    setInput('');
    setIsResponding(true);

    const history = activeSession?.messages.map(({ id, createdAt, ...rest }) => rest) || [];
    const result = await getAiResponse(currentInput, history);
    
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
  };
  
  if (!activeSession) {
    return (
      <div className="w-full max-w-3xl h-[75vh] flex items-center justify-center">
        <p>Select a chat or start a new one.</p>
      </div>
    );
  }


  return (
    <div className="w-full max-w-3xl h-[calc(100vh-4rem)] flex flex-col">
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
