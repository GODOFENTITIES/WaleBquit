import { ChatLayout } from '@/components/chat/chat-layout';
import { HistorySidebar } from '@/components/chat/history-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <HistorySidebar />
        <SidebarInset>
          <main className="relative flex flex-1 flex-col items-center justify-start p-4 pt-16 md:pt-4">
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
