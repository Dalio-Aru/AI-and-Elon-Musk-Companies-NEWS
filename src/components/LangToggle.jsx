import React from 'react';
import { useLang } from '../context/LangContext.jsx';
import { t } from '../i18n.js';

export default function LangToggle() {
  const { lang, toggle } = useLang();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-bg-soft/80 px-2.5 py-1.5 text-xs font-semibold tracking-wider transition hover:border-accent/40 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
    >
      <span className={lang === 'en' ? 'text-accent' : 'text-ink-muted'}>EN</span>
      <span className="text-ink-muted">/</span>
      <span className={lang === 'zh' ? 'text-accent' : 'text-ink-muted'}>CN</span>
    </button>
  );
}
