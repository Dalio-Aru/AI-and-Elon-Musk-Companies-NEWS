import React, { useEffect } from 'react';
import { X, ExternalLink, Globe } from 'lucide-react';
import TagPill from './TagPill.jsx';

export default function Drawer({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-bg-card/95 shadow-2xl ring-1 ring-white/10">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <TagPill tone={item.category === 'ai' ? 'accent' : 'musk'}>
                {item.category === 'ai' ? 'AI' : item.company || 'Musk'}
              </TagPill>
              {item.topic && <TagPill>{item.topic}</TagPill>}
            </div>
            <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
            <p className="mt-2 text-xs text-ink-muted">
              {item.source} · {new Date(item.publishedAt || Date.now()).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn !p-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {item.summary ? (
            <p className="text-sm leading-relaxed text-ink-primary">{item.summary}</p>
          ) : (
            <p className="text-sm text-ink-secondary">
              No summary available. Visit the original source for the full story.
            </p>
          )}
        </div>

        <div className="border-t border-white/5 p-5">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent ring-1 ring-accent/30 transition hover:bg-accent/25"
            >
              <Globe className="h-4 w-4" />
              Read original article
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <div className="text-xs text-ink-muted">No external link available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
