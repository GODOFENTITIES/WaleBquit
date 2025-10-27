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
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, PanelLeft } from 'lucide-react';
import { useChatHistory } from '@/hooks/chat-history-provider';
import { Logo } from '../logo';
import { cn } from '@/lib/utils';

export function HistorySidebar() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    startNewSession,
    deleteSession,
  } = useChatHistory();
  
  const { state, isMobile, toggleSidebar } = useSidebar();

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <Logo />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight font-headline">
                WaleBquit
              </h1>
              <p className="text-xs text-sidebar-foreground/70">by GOD_OF_ENTITIES</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <Button
            variant="default"
            className="w-full justify-start h-10 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
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
                  className="truncate h-10"
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
        <SidebarFooter className='p-2'>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
