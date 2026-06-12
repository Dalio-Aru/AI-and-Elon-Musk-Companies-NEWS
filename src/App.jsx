import React, { useMemo, useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TabFilter from './components/TabFilter.jsx';
import NewsSection from './components/NewsSection.jsx';
import BackToTop from './components/BackToTop.jsx';
import { loadAllNews, filterItems, getTodayYmd } from './utils/loadNews.js';

export default function App() {
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
        {/* Hero: hide when searching to focus on results */}
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
          /* Search mode: unified results */
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-ink-secondary">
                Searching for{' '}
                <span className="font-semibold text-accent">&ldquo;{query.trim()}&rdquo;</span>
                {' \u2014 '}
                <span className="font-mono">{rangeFiltered.length}</span> result{rangeFiltered.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setQuery('')}
                className="text-xs font-medium text-accent hover:underline"
              >
                Clear
              </button>
            </div>

            {rangeFiltered.length === 0 ? (
              <div className="glass-card p-10 text-center">
                <div className="text-base font-semibold">No results found.</div>
                <p className="mt-2 text-sm text-ink-secondary">
                  Try different keywords or check your spelling.
                </p>
              </div>
            ) : (
              <NewsSection
                title="Search Results"
                hint=""
                tone="accent"
                items={rangeFiltered}
              />
            )}
          </>
        ) : (
          /* Browse mode: split sections */
          <>
            <NewsSection
              title="AI Industry"
              hint="Models, agents, chips, policy, research."
              tone="accent"
              items={aiItems}
            />

            <NewsSection
              title="Elon Musk's Companies"
              hint="Tesla, SpaceX, X, Neuralink, The Boring Company, xAI, Starlink."
              tone="musk"
              items={muskItems}
            />

            {rangeFiltered.length === 0 && (
              <div className="glass-card p-10 text-center">
                <div className="text-base font-semibold">No news matching your filters.</div>
                <p className="mt-2 text-sm text-ink-secondary">
                  Try widening the date range, clearing the search, or run{' '}
                  <code className="pill">npm run fetch-news</code> to refresh the data.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-ink-muted">
        Built with React + Vite + Tailwind &middot; Data from NewsAPI.org &middot; &copy; {new Date().getFullYear()}
      </footer>

      <BackToTop />
    </div>
  );
}
