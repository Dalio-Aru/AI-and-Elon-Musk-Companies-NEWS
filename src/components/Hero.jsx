import React from 'react';
import { Sparkles, Rocket, Cpu, Clock, ExternalLink, Calendar, ArrowUpRight } from 'lucide-react';
import { useLang } from '../context/LangContext.jsx';
import { t } from '../i18n.js';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const m = months[d.getMonth()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${m} ${day}, ${hh}:${mm}`;
}

function TopStoryLabel(item, lang) {
  if (item.category === 'ai') return t('aiTopStory', {}, lang);
  if (item.company) return `${item.company.toUpperCase()} ${t('muskTopStoryPrefix', {}, lang)}`;
  return `MUSK ${t('muskTopStoryPrefix', {}, lang)}`;
}

function PillTone(item) {
  return item.category === 'ai' ? 'accent' : 'musk';
}

function CoverImage({ item, className }) {
  const tone = PillTone(item);
  const Icon = item.category === 'ai' ? Cpu : Rocket;
  const label = item.category === 'ai' ? 'AI' : item.company || 'MUSK';

  if (item.imageUrl) {
    return (
      <div className={className}>
        <div className="absolute inset-0 border-t border-accent/30" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-transparent to-transparent" />
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-bg-card to-bg-soft`}
    >
      <div className="absolute inset-0 border-t border-accent/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 via-transparent to-transparent" />
      <div className="relative flex flex-col items-center gap-3 text-ink-secondary">
        <Icon
          className={`h-12 w-12 ${tone === 'accent' ? 'text-accent' : 'text-musk'}`}
          strokeWidth={1.5}
        />
        <span className="pill">{label}</span>
      </div>
    </div>
  );
}

function CategoryPill({ item, lang }) {
  const tone = PillTone(item);
  const isAccent = tone === 'accent';
  const label = TopStoryLabel(item, lang);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
        isAccent
          ? 'bg-accent text-bg-card shadow-[0_0_16px_rgba(0,229,255,0.35)]'
          : 'bg-musk text-white shadow-[0_0_16px_rgba(225,29,72,0.35)]'
      }`}
    >
      {isAccent ? <Cpu className="h-3 w-3" /> : <Rocket className="h-3 w-3" />}
      {label}
    </span>
  );
}

function handleOpen(item) {
  if (item?.url) window.open(item.url, '_blank', 'noopener,noreferrer');
}

function BigCard({ item, lang }) {
  if (!item) return null;
  const displayTitle = lang === 'zh' && item.titleZh ? item.titleZh : item.title;
  const displaySummary = lang === 'zh' && item.summaryZh ? item.summaryZh : item.summary;

  return (
    <article
      onClick={() => handleOpen(item)}
      className="group relative flex min-h-[360px] cursor-pointer flex-col overflow-hidden border border-white/10 bg-bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-[2px] hover:shadow-glow sm:rounded-2xl md:flex-row md:min-h-[420px]"
    >
      <div className="relative w-full overflow-hidden sm:h-56 md:w-1/2 md:h-auto">
        <CoverImage item={item} className="relative h-full w-full overflow-hidden" />
      </div>
      <div className="relative flex flex-1 flex-col justify-between p-6 md:w-1/2 md:p-8">
        <div className="relative">
          <CategoryPill item={item} lang={lang} />
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-ink-primary transition-colors group-hover:text-accent md:text-[28px] md:leading-tight">
            {displayTitle}
          </h2>
          {displaySummary && (
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary md:text-[15px]">
              {displaySummary}
            </p>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="font-medium text-ink-secondary">{item.source}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(item.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

function SmallCard({ item, lang }) {
  if (!item) return null;
  const tone = PillTone(item);
  const isAccent = tone === 'accent';
  const Icon = isAccent ? Cpu : Rocket;
  const pillLabel = isAccent ? 'AI' : (item.company || 'MUSK').toUpperCase();
  const hasImage = Boolean(item.imageUrl);
  const displayTitle = lang === 'zh' && item.titleZh ? item.titleZh : item.title;

  return (
    <article
      onClick={() => handleOpen(item)}
      className="group relative min-h-[200px] w-full flex-1 cursor-pointer overflow-hidden border border-white/10 sm:rounded-2xl transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-glow"
    >
      <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-105 origin-center">
        {hasImage ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-bg-card to-bg-soft text-ink-secondary">
            <Icon
              className={`h-12 w-12 ${isAccent ? 'text-accent' : 'text-musk'}`}
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1222]/95 via-[#0b1222]/40 to-transparent" />

      <span
        className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
          isAccent
            ? 'bg-[#00E5FF] text-bg-card'
            : 'bg-[#E11D48] text-white'
        }`}
      >
        {pillLabel}
      </span>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4 sm:p-5">
        <h3 className="text-lg font-bold leading-tight text-white md:text-xl">
          {displayTitle}
        </h3>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-medium text-white">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {item.source || 'Unknown'}
          </span>
          <span className="font-mono text-white/80">
            {formatDate(item.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function Hero({ today, fetchedAt, topItems }) {
  const { lang } = useLang();
  const headline = topItems && topItems.length ? topItems[0] : null;
  const sub = topItems && topItems.length > 1 ? topItems.slice(1, 3) : [];

  return (
    <section className="mb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-title mb-3 flex items-center gap-2 text-ink-secondary">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>{t('heroLabel', {}, lang)}</span>
            <span className="text-ink-muted">· {today}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {t('heroTitle', {}, lang)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
            {t('heroDesc', {}, lang)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-accent shadow-glow" />
          {fetchedAt ? `${t('heroUpdated', {}, lang)} ${fetchedAt}` : t('heroLoading', {}, lang)}
        </div>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
        <div className="md:col-span-2 animate-slide-in-left">
          {headline ? (
            <BigCard item={headline} lang={lang} />
          ) : (
            <div className="flex min-h-[360px] items-center justify-center border border-white/10 bg-bg-card/80 p-6 text-sm text-ink-secondary sm:rounded-2xl md:min-h-[420px]">
              {t('heroNoTopStories', {}, lang)}{' '}
              <code className="pill mx-2">npm run fetch-news</code>{' '}
              {t('heroRunFetch', {}, lang)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:gap-3 animate-slide-in-right">
          {sub.map((it) => (
            <SmallCard key={it.id} item={it} lang={lang} />
          ))}
          {sub.length === 0 && headline && (
            <div className="flex items-center justify-center border border-white/10 bg-bg-card/80 p-6 text-sm text-ink-secondary sm:rounded-2xl">
              {t('heroFillSidebar', {}, lang)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
