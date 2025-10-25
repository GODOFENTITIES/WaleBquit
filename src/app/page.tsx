import { ChatLayout } from '@/components/chat/chat-layout';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center text-center mb-8 relative">
        <Logo />
        <h1 className="text-4xl font-bold tracking-tight mt-4 font-headline">
          WaleBquit
        </h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered assistant for daily needs.
        </p>
        <p className="font-handwritten text-2xl absolute top-full right-0 -mr-16 mt-1 rotate-[15deg] text-foreground/80">
          by GOD_OF_ENTITIES
        </p>
      </div>
      <ChatLayout />
    </main>
  );
}
