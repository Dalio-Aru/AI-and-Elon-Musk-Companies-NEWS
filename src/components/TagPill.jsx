import React from 'react';

export default function TagPill({ children, tone = 'neutral' }) {
  const toneClass =
    tone === 'accent'
      ? 'border-accent/30 bg-accent/10 text-accent'
      : tone === 'musk'
      ? 'border-musk/30 bg-musk/10 text-musk'
      : '';
  return (
    <span className={`pill ${toneClass}`}>
      {children}
    </span>
  );
}
