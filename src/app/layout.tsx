import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ChatHistoryProvider } from '@/hooks/chat-history-provider';

export const metadata: Metadata = {
  title: 'WaleBquit',
  description: 'Your everyday AI assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        'font-body antialiased min-h-screen',
      )}>
        <ChatHistoryProvider>
          {children}
        </ChatHistoryProvider>
        <Toaster />
      </body>
    </html>
  );
}
