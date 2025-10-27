'use client';

import type { ChatSession, Message } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const HISTORY_STORAGE_KEY = 'chat_history';

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      const loadedSessions = storedHistory ? JSON.parse(storedHistory) : [];
      
      // Ensure all loaded messages have Date objects
      for (const session of loadedSessions) {
        for (const message of session.messages) {
          message.createdAt = new Date(message.createdAt);
        }
        session.createdAt = new Date(session.createdAt);
      }

      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        if (!activeSessionId) {
          setActiveSessionId(loadedSessions[0].id);
        }
      } else {
        // If no sessions exist, create one.
        const newSession = createNewSession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);
      }

    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      // If loading fails, start with a fresh session
      const newSession = createNewSession();
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, []);

  useEffect(() => {
    // Persist sessions to localStorage whenever they change
    if (sessions.length > 0) {
      try {
        const currentSessions = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
        if (JSON.stringify(currentSessions) !== JSON.stringify(sessions)) {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sessions));
        }
      } catch (error) {
        console.error("Failed to save chat history to localStorage", error);
      }
    } else {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  }, [sessions]);

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
      // Move the updated session to the top
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
