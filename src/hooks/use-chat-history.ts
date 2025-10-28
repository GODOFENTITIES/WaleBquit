'use client';

import type { ChatSession, Message } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

const createNewSessionObject = (userId: string): Omit<ChatSession, 'id'> => ({
  title: 'New Chat',
  createdAt: new Date(),
  messages: [
    {
      id: 'init',
      role: 'assistant',
      content:
        "Hello! I'm WaleBquit. I can help you generate ideas, summarize web pages, and much more. What's on your mind?",
      createdAt: new Date(),
    },
  ],
  userId,
});


export function useChatHistory() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'users', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user?.uid]);

  const { data: sessions, isLoading: sessionsLoading } = useCollection<ChatSession>(sessionsQuery);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionsLoading && sessions && sessions.length > 0) {
      if (!activeSessionId || !sessions.some(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions[0].id);
      }
    }
  }, [sessions, sessionsLoading, activeSessionId]);

  const startNewSession = useCallback(async () => {
    if (!firestore || !user?.uid) return;

    const newSessionData = createNewSessionObject(user.uid);
    const sessionsCollection = collection(firestore, 'users', user.uid, 'sessions');
    
    try {
      const docRef = await addDocumentNonBlocking(sessionsCollection, newSessionData);
      if (docRef) {
        setActiveSessionId(docRef.id);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  }, [firestore, user?.uid]);


  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    if (!firestore || !user?.uid) return;
    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    
    const currentSession = sessions?.find(s => s.id === sessionId);
    if (currentSession) {
      const updatedMessages = [...currentSession.messages, message];
      updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
    }
  }, [firestore, user?.uid, sessions]);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    if (!firestore || !user?.uid) return;
    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    updateDocumentNonBlocking(sessionRef, { title });
  }, [firestore, user?.uid]);
  
  const updateMessageInSession = useCallback((sessionId: string, messageId: string, updatedContent: string) => {
      if (!firestore || !user?.uid) return;
      const currentSession = sessions?.find(s => s.id === sessionId);
      if (currentSession) {
        const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
        const updatedMessages = currentSession.messages.map(msg =>
          msg.id === messageId ? { ...msg, content: updatedContent } : msg
        );
        updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
      }
    }, [firestore, user?.uid, sessions]
  );

  const removeMessageFromSession = useCallback((sessionId: string, messageId: string) => {
    if (!firestore || !user?.uid) return;
    const currentSession = sessions?.find(s => s.id === sessionId);
    if(currentSession) {
      const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
      const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId);
      updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
    }
  }, [firestore, user?.uid, sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    if (!firestore || !user?.uid) return;
    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    deleteDocumentNonBlocking(sessionRef);

    if (activeSessionId === sessionId) {
      const remainingSessions = sessions?.filter(s => s.id !== sessionId);
      if (remainingSessions && remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  }, [firestore, user?.uid, activeSessionId, sessions]);
  
  const activeSession = sessions?.find(session => session.id === activeSessionId);
  
  // Auto-create a session if none exist for the user
  useEffect(() => {
    const isLoaded = !isUserLoading && !sessionsLoading;
    if (isLoaded && user && sessions?.length === 0) {
      startNewSession();
    }
  }, [isUserLoading, sessionsLoading, user, sessions, startNewSession]);


  return {
    sessions: sessions || [],
    activeSession,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    addMessageToSession,
    updateMessageInSession,
    removeMessageFromSession,
    deleteSession,
    updateSessionTitle,
    isLoading: isUserLoading || sessionsLoading,
  };
}
