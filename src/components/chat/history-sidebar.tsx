'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useChatHistory } from '@/hooks/use-chat-history';
import { Logo } from '../logo';

export function HistorySidebar() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    deleteSession,
  } = useChatHistory();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight font-headline">
              WaleBquit
            </h1>
            <p className="text-xs text-muted-foreground">by GOD_OF_ENTITIES</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={startNewSession}
        >
          <Plus className="mr-2" />
          New Chat
        </Button>
        <SidebarMenu className="mt-4">
          {sessions.map((session) => (
            <SidebarMenuItem key={session.id}>
              <SidebarMenuButton
                onClick={() => setActiveSessionId(session.id)}
                isActive={session.id === activeSessionId}
                className="truncate"
              >
                {session.title}
              </SidebarMenuButton>
              <SidebarMenuAction
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                aria-label="Delete session"
              >
                <Trash2 />
              </SidebarMenuAction>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
