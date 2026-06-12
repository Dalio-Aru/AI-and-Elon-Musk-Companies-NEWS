import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-bg-card/90 text-accent shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-soft"
      style={{ right: 'calc(50% - 620px)' }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
