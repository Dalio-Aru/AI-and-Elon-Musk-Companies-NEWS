import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COMPANIES, TOPICS } from '../utils/constants.js';
import { useLang } from '../context/LangContext.jsx';
import { t, tCompany, tTopic } from '../i18n.js';

export default function TabFilter({
  range,
  onRangeChange,
  category,
  onCategoryChange,
  company,
  onCompanyChange,
  topic,
  onTopicChange,
  counts,
}) {
  const { lang } = useLang();

  const TABS = [
    { key: 'today', label: t('tabToday', {}, lang) },
    { key: 'week', label: t('tabWeek', {}, lang) },
  ];

  const categoryOptions = [
    { value: 'all', label: t('filterAll', {}, lang) },
    { value: 'ai', label: t('filterAI', {}, lang) },
    { value: 'musk', label: t('filterMusk', {}, lang) },
  ];
  const companyOptions = [
    { value: 'all', label: t('filterAllCompanies', {}, lang) },
    ...COMPANIES.map((c) => ({ value: c, label: tCompany(c, lang) })),
  ];
  const topicOptions = [
    { value: 'all', label: t('filterAllTopics', {}, lang) },
    ...TOPICS.map((t) => ({ value: t, label: tTopic(t, lang) })),
  ];

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-1 rounded-xl border border-white/10 bg-bg-soft/60 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onRangeChange(tab.key)}
            className={
              'rounded-lg px-3 py-1.5 text-sm font-medium transition ' +
              (range === tab.key
                ? 'bg-accent/15 text-accent shadow-glow-soft'
                : 'text-ink-secondary hover:text-ink-primary')
            }
          >
            {tab.label}
            <span className="ml-2 font-mono text-[10px] text-ink-muted">
              {counts[tab.key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <CustomSelect
          label={t('filterCategory', {}, lang)}
          value={category}
          onChange={onCategoryChange}
          options={categoryOptions}
        />
        <CustomSelect
          label={t('filterCompany', {}, lang)}
          value={company}
          onChange={onCompanyChange}
          options={companyOptions}
          disabled={category === 'ai'}
        />
        <CustomSelect
          label={t('filterTopic', {}, lang)}
          value={topic}
          onChange={onTopicChange}
          options={topicOptions}
        />
      </div>
    </div>
  );
}

function CustomSelect({ label, value, onChange, options, disabled }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const panelRef = useRef(null);

  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function onDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          'inline-flex items-center gap-2 rounded-lg border border-white/10 bg-bg-soft/80 px-2.5 py-1.5 text-sm text-ink-primary transition focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 ' +
          (disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-white/20')
        }
      >
        <span className="hidden sm:inline text-ink-secondary">{label}:</span>
        <span className="font-medium">{current?.label}</span>
        <ChevronDown
          size={14}
          className={
            'text-ink-muted transition-transform duration-180 ' +
            (open ? 'rotate-180' : '')
          }
        />
      </button>

      <div
        ref={panelRef}
        className={
          'absolute right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-bg-soft shadow-lg ' +
          (open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none')
        }
        style={{ transition: 'opacity 180ms ease, transform 180ms ease' }}
        role="listbox"
      >
        <ul className="max-h-72 min-w-[180px] overflow-y-auto py-1">
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(o.value)}
                  className={
                    'flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-sm transition ' +
                    (selected
                      ? 'bg-accent/15 text-accent'
                      : 'text-ink-primary hover:bg-white/5 hover:text-ink-primary')
                  }
                  role="option"
                  aria-selected={selected}
                >
                  <span>{o.label}</span>
                  {selected && <span className="text-xs opacity-70">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
