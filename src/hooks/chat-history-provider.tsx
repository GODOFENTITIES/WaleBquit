'use client';
import { useChatHistory as useChatHistoryHook } from './use-chat-history';
import { createContext, useContext } from 'react';

type ChatHistoryContextType = ReturnType<typeof useChatHistoryHook>;

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const chatHistory = useChatHistoryHook();
  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistory(): ChatHistoryContextType {
  const context = useContext(ChatHistoryContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
}
