import React from 'react';
import { Clock, ArrowUpRight, Cpu, Rocket } from 'lucide-react';
import TagPill from './TagPill.jsx';
import { formatRelative } from '../utils/loadNews.js';
import { useLang } from '../context/LangContext.jsx';
import { t } from '../i18n.js';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[d.getMonth()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m} ${day}, ${hh}:${mm}`;
}

function Thumbnail({ item }) {
  const isAccent = item.category === 'ai';
  const Icon = isAccent ? Cpu : Rocket;

  if (!item.imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-bg-soft to-bg-card">
        <Icon
          className={`h-6 w-6 ${isAccent ? 'text-accent/50' : 'text-musk/50'}`}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  return (
    <img
      src={item.imageUrl}
      alt={item.title}
      loading="lazy"
      className="h-full w-full rounded-lg object-cover"
    />
  );
}

function handleOpen(item) {
  if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer');
}

export default function NewsCard({ item, index, className, style }) {
  if (!item) return null;
  const { lang } = useLang();
  const isAccent = item.category === 'ai';
  const borderTone = isAccent ? 'border-l-accent' : 'border-l-musk';
  const isFirst = index === 0;

  // Use translated text when in CN mode, fall back to English
  const displayTitle = lang === 'zh' && item.titleZh ? item.titleZh : item.title;
  const displaySummary = lang === 'zh' && item.summaryZh ? item.summaryZh : item.summary;

  return (
    <article
      onClick={() => handleOpen(item)}
      style={style}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-white/10 hover:bg-bg-card/80 hover:shadow-glow-soft ${
        isFirst ? 'ring-1 ring-accent/10' : ''
      } bg-white/[0.01] ${className || ''}`}
    >
      {/* Left color bar */}
      <div
        className={`absolute inset-y-0 left-0 w-[3px] ${borderTone} ${isFirst ? '' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}
      />

      <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
        {/* Thumbnail */}
        <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden sm:block lg:h-28 lg:w-40">
          <Thumbnail item={item} />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
          {/* Top row: tags + time */}
          <div className="flex flex-wrap items-center gap-2">
            <TagPill tone={isAccent ? 'accent' : 'musk'}>
              {isAccent ? 'AI' : item.company || 'Musk'}
            </TagPill>
            {item.topic && <TagPill>{item.topic}</TagPill>}
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <Clock className="h-3 w-3" />
              {formatRelative(item.publishedAt)}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`flex-1 font-semibold leading-snug group-hover:text-accent-soft ${
              isFirst ? 'text-lg sm:text-xl' : 'text-base'
            }`}
          >
            {displayTitle}
          </h3>

          {/* Summary - truncated */}
          {displaySummary && (
            <p className="line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              {displaySummary}
            </p>
          )}

          {/* Bottom: source + date */}
          <div className="flex items-center justify-between text-[11px] text-ink-muted/70">
            <span className="inline-flex items-center gap-1.5">
              <ArrowUpRight className="h-3 w-3" />
              {item.source || t('unknownSource', {}, lang)}
            </span>
            <span className="font-mono">{formatDate(item.publishedAt)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
