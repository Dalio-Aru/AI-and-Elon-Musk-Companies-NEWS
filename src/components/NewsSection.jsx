import React from 'react';
import NewsCard from './NewsCard.jsx';

export default function NewsSection({ title, hint, items, onOpen, tone }) {
  const color = tone === 'musk' ? 'border-musk/30 text-musk' : 'border-accent/30 text-accent';

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${color}`}>
            {title}
          </div>
          {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
        </div>
        <div className="text-xs text-ink-muted">{items.length} items</div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-8 text-center text-sm text-ink-secondary">
          No items in this section for the selected date range.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <NewsCard key={it.id} item={it} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
