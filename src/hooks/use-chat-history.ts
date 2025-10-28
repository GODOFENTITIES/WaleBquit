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
    
    try {
      const docRef = await addDocumentNonBlocking(sessionsCollection, newSessionData);
      if (docRef) {
        // The real-time listener from useCollection will add the new session.
        // We just need to set it as active.
        setActiveSessionId(docRef.id);
      }
    } catch (error) {
      console.error("Error creating new session:", error);
    }
  }, [firestore, user?.uid]);


  const addMessageToSession = useCallback((sessionId: string, message: Message) => {
    if (!firestore || !user?.uid) return;
  
    setSessions(prevSessions => {
      const updatedSessions = prevSessions?.map(s => {
        if (s.id === sessionId) {
          const updatedMessages = [...s.messages, message];
          const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
          updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
          return { ...s, messages: updatedMessages };
        }
        return s;
      });
      return updatedSessions || null;
    });
  }, [firestore, user?.uid]);
  

  const updateSessionTitle = useCallback((sessionId: string, title: string) => {
    if (!firestore || !user?.uid) return;
    
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
      
      setSessions(prevSessions => {
        const updatedSessions = prevSessions?.map(s => {
          if (s.id === sessionId) {
            const updatedMessages = s.messages.map(msg =>
              msg.id === messageId ? { ...msg, content: updatedContent } : msg
            );
            const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
            updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
            return { ...s, messages: updatedMessages };
          }
          return s;
        });
        return updatedSessions || null;
      });
    }, [firestore, user?.uid]
  );

  const removeMessageFromSession = useCallback((sessionId: string, messageId: string) => {
    if (!firestore || !user?.uid) return;

    setSessions(prevSessions => {
      const updatedSessions = prevSessions?.map(s => {
        if (s.id === sessionId) {
          const updatedMessages = s.messages.filter(msg => msg.id !== messageId);
          const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);
          updateDocumentNonBlocking(sessionRef, { messages: updatedMessages });
          return { ...s, messages: updatedMessages };
        }
        return s;
      }) || null;

      return updatedSessions;
    });
  }, [firestore, user?.uid]);

  const deleteSession = useCallback((sessionId: string) => {
    if (!firestore || !user?.uid) return;

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
