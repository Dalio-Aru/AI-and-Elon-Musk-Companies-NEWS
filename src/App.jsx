import React, { useMemo, useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TabFilter from './components/TabFilter.jsx';
import NewsSection from './components/NewsSection.jsx';
import BackToTop from './components/BackToTop.jsx';
import LangProvider, { useLang } from './context/LangContext.jsx';
import { loadAllNews, filterItems } from './utils/loadNews.js';
import { t } from './i18n.js';

function AppContent() {
  const { lang } = useLang();
  const bundle = useMemo(() => loadAllNews(), []);
  const todayYmd = bundle.today;

  const [query, setQuery] = useState('');
  const [range, setRange] = useState('today');
  const [category, setCategory] = useState('all');
  const [company, setCompany] = useState('all');
  const [topic, setTopic] = useState('all');

  // Reset company when switching to AI only
  useEffect(() => {
    if (category === 'ai') setCompany('all');
  }, [category]);

  const all = bundle.items || [];

  const todayFiltered = useMemo(
    () =>
      filterItems({
        items: all,
        range: 'today',
        todayYmd,
        category: 'all',
        company: 'all',
        topic: 'all',
        query: '',
      }),
    [all, todayYmd],
  );

  const rangeFiltered = useMemo(
    () =>
      filterItems({
        items: all,
        range,
        todayYmd,
        category,
        company,
        topic,
        query,
      }),
    [all, range, category, company, topic, query, todayYmd],
  );

  const aiItems = rangeFiltered.filter((it) => it.category === 'ai');
  const muskItems = rangeFiltered.filter((it) => it.category === 'musk');

  const topHeadlines = todayFiltered
    .slice()
    .sort((a, b) => (b.topNews ? 1 : 0) - (a.topNews ? 1 : 0))
    .slice(0, 3);

  const weekCount = all.length;
  const todayCount = todayFiltered.length;

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen text-ink-primary">
      <Navbar query={query} onQueryChange={setQuery} />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        {/* Hero: hide when searching */}
        {!isSearching && (
          <Hero
            today={bundle.today}
            fetchedAt={bundle.fetchedAt}
            topItems={topHeadlines}
          />
        )}

        {!isSearching && (
          <TabFilter
            range={range}
            onRangeChange={setRange}
            category={category}
            onCategoryChange={setCategory}
            company={company}
            onCompanyChange={setCompany}
            topic={topic}
            onTopicChange={setTopic}
            counts={{ today: todayCount, week: weekCount }}
          />
        )}

        {isSearching ? (
          /* Search mode */
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-ink-secondary">
                {t('searchingFor', { q: query.trim(), count: rangeFiltered.length, plural: rangeFiltered.length !== 1 ? 's' : '' }, lang)}
              </p>
              <button
                onClick={() => setQuery('')}
                className="text-xs font-medium text-accent hover:underline"
              >
                {t('clearSearch', {}, lang)}
              </button>
            </div>

            {rangeFiltered.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <div className="text-base font-semibold">{t('noResultsFound', {}, lang)}</div>
                <p className="mt-2 text-sm text-ink-secondary">
                  {t('tryDifferentKeywords', {}, lang)}
                </p>
              </div>
            ) : (
              <NewsSection
                title={t('searchResults', {}, lang)}
                hint=""
                tone="accent"
                items={rangeFiltered}
              />
            )}
          </>
        ) : (
          /* Browse mode */
          <>
            <NewsSection
              title={t('sectionAi', {}, lang)}
              hint={t('sectionAiHint', {}, lang)}
              tone="accent"
              items={aiItems}
            />

            <NewsSection
              title={t('sectionMusk', {}, lang)}
              hint={t('sectionMuskHint', {}, lang)}
              tone="musk"
              items={muskItems}
            />

            {rangeFiltered.length === 0 && (
              <div className="glass-card p-10 text-center">
                <div className="text-base font-semibold">{t('noNewsMatching', {}, lang)}</div>
                <p className="mt-2 text-sm text-ink-secondary">
                  {t('tryWidening', {}, lang)}{' '}
                  <code className="pill mx-2">npm run fetch-news</code>{' '}
                  {t('toRefreshData', {}, lang)}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-ink-muted">
        {t('footer', { year: new Date().getFullYear() }, lang)}
      </footer>

      <BackToTop />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppContent />
    </LangProvider>
  );
}
