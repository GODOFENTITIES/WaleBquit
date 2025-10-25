import { useState, useEffect } from 'react';

export function useTypewriter(text: string, enabled: boolean = true, speed: number = 20) {
  const [displayText, setDisplayText] = useState(enabled ? '' : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }
    
    setDisplayText('');
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, enabled, speed]);

  return displayText;
}
