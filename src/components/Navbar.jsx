import React from 'react';
import { Search, X } from 'lucide-react';

export default function Navbar({ query, onQueryChange }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent shadow-glow-soft">
            <span className="font-mono text-sm font-bold">N</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-sm font-semibold">AI &amp; Musk News</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              daily brief
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative ml-auto flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={query ? '' : 'Search news by title, source…'}
            className="w-full rounded-lg border border-white/10 bg-bg-soft/70 py-2 pl-9 pr-9 text-sm text-ink-primary placeholder:text-ink-muted focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
          />
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink-primary hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
