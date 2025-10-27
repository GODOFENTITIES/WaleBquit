'use client';

import type { ChatSession, Message } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'chat_history';

const createNewSession = (): ChatSession => {
  return {
    id: `session_${Date.now()}`,
    title: 'New Chat',
    createdAt: new Date(),
    messages: [{
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm WaleBquit. I can help you generate ideas, summarize web pages, and much more. What's on your mind?",
      createdAt: new Date(),
    }],
  };
};

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const loadedSessions = JSON.parse(storedHistory).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          messages: session.messages.map((message: any) => ({
            ...message,
            createdAt: new Date(message.createdAt),
          })),
        }));
        
        if (loadedSessions.length > 0) {
          setSessions(loadedSessions);
          setActiveSessionId(loadedSessions[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && sessions.length === 0) {
      const newSession = createNewSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, [isLoaded, sessions.length]);
  
  useEffect(() => {
    if (isLoaded && sessions.length > 0) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, isLoaded]);
  
  const startNewSession = useCallback(() => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    setSessions(prev => {
      let sessionExists = false;
      const updatedSessions = prev.map(session => {
        if (session.id === sessionId) {
          sessionExists = true;
          return { ...session, messages: [...session.messages, message] };
        }
        return session;
      });

      if (!sessionExists) {
        // This case can happen if the active session was deleted but the UI hasn't updated yet.
        // It's better to not add the message than to create a zombie session.
        return prev;
      }
      
      const currentSession = updatedSessions.find(s => s.id === sessionId);
      const otherSessions = updatedSessions.filter(s => s.id !== sessionId);
      return currentSession ? [currentSession, ...otherSessions] : updatedSessions;
    });
  }, []);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId ? { ...session, title } : session
      )
    );
  }, []);
  
  const updateMessageInSession = useCallback((sessionId: string, messageId: string, updatedContent: string) => {
    setSessions(prev => {
      return prev.map(session => {
        if (session.id === sessionId) {
          const updatedMessages = session.messages.map(msg =>
            msg.id === messageId ? { ...msg, content: updatedContent } : msg
          );
          return { ...session, messages: updatedMessages };
        }
        return session;
      });
    });
  }, []);

  const removeMessageFromSession = useCallback((sessionId: string, messageId: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, messages: session.messages.filter(msg => msg.id !== messageId) }
          : session
      )
    );
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const remainingSessions = prev.filter(session => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (remainingSessions.length > 0) {
          setActiveSessionId(remainingSessions[0].id);
        } else {
          setActiveSessionId(null); 
        }
      }
      if (remainingSessions.length === 0) {
         // The useEffect for isLoaded and sessions.length will create a new one.
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        return [];
      }
      return remainingSessions;
    });
  }, [activeSessionId]);

  const activeSession = sessions.find(session => session.id === activeSessionId);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    addMessageToSession,
    updateMessageInSession,
    removeMessageFromSession,
    deleteSession,
    updateSessionTitle
  };
}
