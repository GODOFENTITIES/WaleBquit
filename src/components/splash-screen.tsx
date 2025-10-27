'use client';

import { AnimatedTitle } from './chat/animated-title';
import { Logo } from './logo';

export function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <AnimatedTitle text="WaleBquit" />
      </div>
    </div>
  );
}
