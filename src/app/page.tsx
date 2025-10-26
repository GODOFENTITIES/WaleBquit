import { ChatLayout } from '@/components/chat/chat-layout';
import { HistorySidebar } from '@/components/chat/history-sidebar';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <HistorySidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col items-center justify-center p-4">
            <ChatLayout />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
