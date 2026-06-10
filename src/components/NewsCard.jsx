import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import TagPill from './TagPill.jsx';
import { formatRelative } from '../utils/loadNews.js';

export default function NewsCard({ item, onOpen }) {
  return (
    <article
      className="glass-card group flex cursor-pointer flex-col gap-3 p-5 transition hover:border-accent/40 hover:shadow-glow-soft sm:flex-row sm:items-start sm:gap-5"
      onClick={() => onOpen && onOpen(item)}
    >
      <div className="flex flex-wrap items-center gap-2 sm:w-52 sm:shrink-0 sm:flex-col sm:items-start">
        <TagPill tone={item.category === 'ai' ? 'accent' : 'musk'}>
          {item.category === 'ai' ? 'AI' : item.company || 'Musk'}
        </TagPill>
        {item.topic && <TagPill>{item.topic}</TagPill>}
        <span className="ml-0 inline-flex items-center gap-1 text-[11px] text-ink-muted sm:mt-1">
          <Clock className="h-3 w-3" />
          {formatRelative(item.publishedAt)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-semibold leading-snug group-hover:text-accent-soft">
          {item.title}
        </h3>

        {item.summary && (
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {item.summary}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span>{item.source || 'Unknown source'}</span>
          <span className="inline-flex items-center gap-1 text-ink-secondary group-hover:text-accent">
            Read original
            <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </div>
    </article>
  );
}
