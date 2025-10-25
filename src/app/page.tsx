import { ChatLayout } from '@/components/chat/chat-layout';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        <h1 className="text-4xl font-bold tracking-tight mt-4 font-headline">
          Pocket AI
        </h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered assistant for daily needs.
        </p>
      </div>
      <ChatLayout />
    </main>
  );
}
