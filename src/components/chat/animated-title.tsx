'use client';

import React, { useEffect, useRef } from 'react';
import anime from 'animejs';
import { cn } from '@/lib/utils';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  const h2Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (h2Ref.current) {
      const chars = Array.from(h2Ref.current.childNodes).filter(
        (node): node is HTMLSpanElement => 
          node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'SPAN'
      );

      anime.timeline({ loop: 3 })
        .add({
          targets: chars,
          translateY: [
            { value: '-1.75em', duration: 400, ease: 'easeOutExpo' },
            { value: 0, duration: 800, ease: 'easeOutBounce' },
          ],
          rotate: ['-15deg', '0deg'],
          opacity: [0, 1],
          delay: anime.stagger(50),
        });
    }
  }, []);

  return (
    <h2 ref={h2Ref} className={cn("text-2xl font-bold mt-4 font-headline flex overflow-hidden", className)}>
      {text.split('').map((char, index) => (
        <span key={index} className="inline-block" style={{ whiteSpace: 'pre' }}>
          {char}
        </span>
      ))}
    </h2>
  );
}
