'use client';

import type { ChatSession, Message } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
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

  const { data: sessionsFromDb, isLoading: sessionsLoading } = useCollection<ChatSession>(sessionsQuery);
  const [sessions, setSessions] = useState<ChatSession[] | null>(sessionsFromDb);

  useEffect(() => {
    // Only update from DB if there's new data.
    if (sessionsFromDb) {
      setSessions(sessionsFromDb);
    }
  }, [sessionsFromDb]);


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
    
    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const newSession: ChatSession = {
      id: tempId,
      ...newSessionData
    };
    
    // Optimistically add the new session with a temporary ID
    setSessions(prev => [newSession, ...(prev || [])]);
    setActiveSessionId(tempId);
    
    try {
      const docRef = await addDocumentNonBlocking(sessionsCollection, newSessionData);
      if (docRef) {
        // Once we get the real ID from Firestore, update the local state.
        // The real-time listener from useCollection will eventually overwrite this,
        // but this makes the UI feel faster.
        setSessions(prev => prev?.map(s => s.id === tempId ? { ...s, id: docRef.id } : s) || null);
        setActiveSessionId(docRef.id);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
      // If there was an error, remove the temporary session
      setSessions(prev => prev?.filter(s => s.id !== tempId) || null);
    }
  }, [firestore, user?.uid]);


  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    if (!firestore || !user?.uid) return;
    
    // Optimistic UI update
    setSessions(prev => 
      prev?.map(s => 
        s.id === sessionId 
          ? { ...s, messages: [...s.messages, message] } 
          : s
      ) || null
    );

    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    const currentSession = sessions?.find(s => s.id === sessionId);
    if (currentSession) {
      const updatedMessages = [...currentSession.messages, message];
      updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
    }
  }, [firestore, user?.uid, sessions]);

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    if (!firestore || !user?.uid) return;
    
    // Optimistic UI update
    setSessions(prev => 
      prev?.map(s => 
        s.id === sessionId 
          ? { ...s, title } 
          : s
      ) || null
    );

    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    updateDocumentNonBlocking(sessionRef, { title });
  }, [firestore, user?.uid]);
  
  const updateMessageInSession = useCallback((sessionId: string, messageId: string, updatedContent: string) => {
      if (!firestore || !user?.uid) return;
      
      // Optimistic UI update
      setSessions(prev => 
        prev?.map(s => {
          if (s.id === sessionId) {
            return {
              ...s,
              messages: s.messages.map(msg =>
                msg.id === messageId ? { ...msg, content: updatedContent } : msg
              )
            };
          }
          return s;
        }) || null
      );

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

    // Optimistic UI update
    setSessions(prev =>
      prev?.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: s.messages.filter(msg => msg.id !== messageId) };
        }
        return s;
      }) || null
    );

    const currentSession = sessions?.find(s => s.id === sessionId);
    if(currentSession) {
      const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
      const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId);
      updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
    }
  }, [firestore, user?.uid, sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    if (!firestore || !user?.uid) return;

    // Optimistic UI update
    const remainingSessions = sessions?.filter(s => s.id !== sessionId) || [];
    setSessions(remainingSessions);
    
    if (activeSessionId === sessionId) {
      if (remainingSessions && remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id);
      } else {
        setActiveSessionId(null);
      }
    }

    const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
    deleteDocumentNonBlocking(sessionRef);

  }, [firestore, user?.uid, activeSessionId, sessions]);
  
  const activeSession = sessions?.find(session => session.id === activeSessionId);
  
  // Auto-create a session if none exist for the user
  useEffect(() => {
    const isLoaded = !isUserLoading && !sessionsLoading;
    if (isLoaded && user && sessionsFromDb?.length === 0) {
      startNewSession();
    }
  }, [isUserLoading, sessionsLoading, user, sessionsFromDb, startNewSession]);


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
