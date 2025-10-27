'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import { HistorySidebar } from '@/components/chat/history-sidebar';
import { SplashScreen } from '@/components/splash-screen';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7700);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <HistorySidebar />
        <SidebarInset>
          <main className="relative flex flex-1 flex-col items-center justify-start p-4 pt-16 md:pt-4">
            <ChatLayout />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
