import { ChatLayout } from '@/components/chat/chat-layout';
import { HistorySidebar } from '@/components/chat/history-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <HistorySidebar />
        <SidebarInset>
          <main className="relative flex flex-1 flex-col items-center justify-center p-4">
            <div className="absolute top-4 left-4">
               <SidebarTrigger />
            </div>
            <ChatLayout />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
