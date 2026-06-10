// src/utils/loadNews.js
import { KEEP_DAYS } from './constants.js';

const files = import.meta.glob('../data/news-*.json', {
  eager: true,
});

function ymdFromFilename(name) {
  const m = name.match(/news-(\d{4}-\d{2}-\d{2})\.json$/);
  return m ? m[1] : null;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function isoYmd(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isoYmdTz(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 19).replace('T', ' ');
  } catch {
    return iso;
  }
}

export function getTodayYmd() {
  return isoYmd(new Date());
}

export function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return isoYmd(new Date(iso));
}

export function loadAllNews() {
  const realToday = getTodayYmd();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - (KEEP_DAYS - 1));
  const cutoff = isoYmd(cutoffDate);

  const bundles = Object.keys(files)
    .map((name) => {
      const ymd = ymdFromFilename(name);
      const content = files[name];
      // Vite's import.meta.glob with eager: true may return modules with default export
      const data = content && content.default ? content.default : content;
      return { ymd, ...data };
    })
    .filter((b) => b.ymd && b.ymd >= cutoff && Array.isArray(b.items))
    .sort((a, b) => (a.ymd < b.ymd ? 1 : -1));

  const latest = bundles[0];

  // If today's bundle doesn't exist, fall back to the latest available so the page
  // still has content to preview. displayYmd is what the UI should show as "today".
  const displayYmd =
    bundles.find((b) => b.ymd === realToday)?.ymd || (latest ? latest.ymd : realToday);

  const allItems = bundles.flatMap((b) =>
    (b.items || []).map((it) => ({ ...it, _ymd: b.ymd })),
  );

  allItems.sort((a, b) => {
    const ta = new Date(a.publishedAt || 0).getTime();
    const tb = new Date(b.publishedAt || 0).getTime();
    return tb - ta;
  });

  return {
    today: displayYmd,
    latestYmd: latest ? latest.ymd : realToday,
    fetchedAt: latest ? isoYmdTz(latest.fetchedAt) : '',
    source: latest ? latest.source : 'local',
    items: allItems,
    bundles,
  };
}

export function filterItems({
  items,
  range,
  todayYmd,
  category,
  company,
  topic,
  query,
}) {
  let result = items.slice();

  if (range === 'today') {
    result = result.filter((it) => it._ymd === todayYmd);
  }

  if (category && category !== 'all') {
    result = result.filter((it) => it.category === category);
  }

  if (company && company !== 'all') {
    result = result.filter((it) => (it.company || 'Other') === company);
  }

  if (topic && topic !== 'all') {
    result = result.filter((it) => it.topic === topic);
  }

  if (query) {
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      result = result.filter(
        (it) =>
          (it.title || '').toLowerCase().includes(q) ||
          (it.summary || '').toLowerCase().includes(q) ||
          (it.source || '').toLowerCase().includes(q),
      );
    }
  }

  return result;
}
