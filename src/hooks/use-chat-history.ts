'use client';

import type { ChatSession, Message } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'chat_history';

const createNewSession = (messages: Message[] = []) => {
  const newSession: ChatSession = {
    id: `session_${Date.now()}`,
    title: 'New Chat',
    createdAt: new Date(),
    messages: messages.length > 0 ? messages : [{
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm WaleBquit. I can help you generate ideas, summarize web pages, and much more. What's on your mind?",
      createdAt: new Date(),
    }],
  };
  return newSession;
};

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      const loadedSessions = storedHistory ? JSON.parse(storedHistory) : [];
      
      if (loadedSessions.length > 0) {
        for (const session of loadedSessions) {
          for (const message of session.messages) {
            message.createdAt = new Date(message.createdAt);
          }
          session.createdAt = new Date(session.createdAt);
        }
        setSessions(loadedSessions);
        if (!activeSessionId || !loadedSessions.some(s => s.id === activeSessionId)) {
          setActiveSessionId(loadedSessions[0].id);
        }
      } else {
        const newSession = createNewSession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      const newSession = createNewSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
    } else {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, [sessions]);
  
  const startNewSession = useCallback(() => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    setSessions(prev => {
      const updatedSessions = prev.map(session => {
        if (session.id === sessionId) {
          const newMessages = [...session.messages, message];
          return { ...session, messages: newMessages };
        }
        return session;
      });
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
          const newSession = createNewSession();
          setActiveSessionId(newSession.id);
          return [newSession];
        }
      }
      if (remainingSessions.length === 0) {
        const newSession = createNewSession();
        setActiveSessionId(newSession.id);
        return [newSession];
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
