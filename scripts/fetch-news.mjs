// scripts/fetch-news.mjs
// Pulls today's AI + Elon Musk related news from newsapi.org and writes src/data/news-YYYY-MM-DD.json.
//
// Setup:
//   1. cp .env.example .env.local
//   2. set NEWS_API_KEY=… (sign up at https://newsapi.org)
//
// Usage:
//   node scripts/fetch-news.mjs
//
// Optional env:
//   NEWS_API_KEY          required
//   HTTPS_PROXY           optional, e.g. http://127.0.0.1:7890
//   NEWS_FETCH_DAYS       integer, default 1

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');

// --- minimal .env parser (avoids extra deps) ---
function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const envLocal = loadEnv(path.join(projectRoot, '.env.local'));
const envDot = loadEnv(path.join(projectRoot, '.env'));
const env = { ...envDot, ...envLocal, ...process.env };

const API_KEY = env.NEWS_API_KEY;
if (!API_KEY || API_KEY === 'your_newsapi_key_here') {
  console.error('[fetch-news] ❌ NEWS_API_KEY not set. Copy .env.example to .env.local and add your key.');
  process.exit(1);
}

// --- search queries ---
// NewsAPI free plan has limited /everything search. We run multiple queries and dedupe.
const QUERIES = [
  { q: 'ai OR artificial intelligence OR llm OR agents', category: 'ai' },
  { q: '"generative ai" OR "machine learning" OR "foundation model"', category: 'ai' },
  { q: 'tesla OR "elon musk" OR spacex OR neuralink OR xai OR "boring company" OR starlink', category: 'musk' },
];

// --- Layer 1: Source whitelist ---
// Only keep articles from trusted publishers.
const SOURCE_WHITELIST = new Set([
  // Tier 1 — premium outlets
  'reuters', 'bloomberg', 'the information', 'financial times', 'wall street journal',
  'the new york times', 'the guardian', 'bbc news', 'cnn', 'washington post',
  // Tier 2 — tech-focused
  'techcrunch', 'the verge', 'wired', 'ars technica', 'engadget', 'venturebeat',
  'axios', 'mit technology review', 'the register', 'zdnet', 'cnbc',
  'fortune', 'business insider', 'marketwatch', 'yahoo finance', 'seeking alpha',
  // Tier 3 — Musk / EV / space focused
  'electrek', 'teslarati', 'tesmanian', 'spacex newsroom', 'x blog',
  'space news', 'aviation week',
  // Tier 4 — policy & general interest
  'politico', 'the hill', 'associated press', 'npr', 'the atlantic',
  'arstechnica', 'gizmodo', 'mashable', 'the next web', 'decrypt',
  'coindesk', 'the block', 'techspot', 'pcmag', 'tom\'s hardware',
]);

// Known junk / non-news domains to always exclude
const JUNK_DOMAINS = new Set([
  'pypi.org', 'npmjs.com', 'github.com', 'youtube.com', 'reddit.com',
  'medium.com', 'substack.com', 'linkedin.com', 't.me', 'discord.com',
  'patreon.com', 'buy me a coffee', 'buymeacoffee.com', 'itch.io',
]);

const TOPIC_RULES = [
  { test: (t) => /\b(llm|foundation model|gpt|claude|gemini|grok|mistral|large language model)\b/i.test(t), topic: 'LLMs' },
  { test: (t) => /\b(multimodal|vision|image generation|video generation|text-to-|whisper|tts)\b/i.test(t), topic: 'Multimodal' },
  { test: (t) => /\b(agent|autonomous agent|tool use|workflow)\b/i.test(t), topic: 'Agents' },
  { test: (t) => /\b(robot|optimus|humanoid|neuralink)\b/i.test(t), topic: 'Robotics' },
  { test: (t) => /\b(fsd|autopilot|autonomous driving|self-driving)\b/i.test(t), topic: 'Autonomous' },
  { test: (t) => /\b(chip|gpu|nvidia|blackwell|h200|b200|semiconductor|tsmc|compute)\b/i.test(t), topic: 'Chips' },
  { test: (t) => /\b(regulation|policy|act|ban|governance|fda|eu ai act)\b/i.test(t), topic: 'Policy' },
  { test: (t) => /\b(funding|acquir|raise|series|valuation|acquisition|merger|investment)\b/i.test(t), topic: 'Funding / M&A' },
  { test: (t) => /\b(launch|release|roll out|unveil|v\d+|version|product)\b/i.test(t), topic: 'Product Launch' },
];

function pickCompany(title) {
  const lower = title.toLowerCase();
  if (lower.includes('spacex') || /starship|falcon|booster/.test(lower)) return 'SpaceX';
  if (lower.includes('starlink')) return 'Starlink';
  if (lower.includes('tesla') || lower.includes('fsd') || lower.includes('autopilot')) return 'Tesla';
  if (lower.includes('xai') || /\bgrok\b/.test(lower)) return 'xAI';
  if (lower.includes('neuralink')) return 'Neuralink';
  if (lower.includes('boring')) return 'The Boring Company';
  if (/(?:^|\s)x\b|@x\b|x\.com|x corp|x platform/.test(lower)) return 'X';
  return 'Other';
}

function pickTopic(title) {
  for (const r of TOPIC_RULES) if (r.test(title)) return r.topic;
  return 'Other';
}

// --- Layer 2: Title blacklist ---
// Returns true if the title looks like junk / non-news content.
function isJunkTitle(title, url, source) {
  const t = (title || '').trim();
  const lower = t.toLowerCase();

  // Too short to be meaningful
  if (t.length < 25) return true;

  // Version / release number pattern (e.g. "exfer-mcp 0.3.3", "react 19.1.0")
  if (/^\S+[\s-]?\d+\.\d+/.test(t) && !/\b(break|launch|release|update|announce|new)\b/i.test(t)) return true;

  // Pure stock ticker / price analysis
  if (/^(is|are|why|what|how)\s+(.+)?\s+(a\s+)?(good|bad|strong|weak|buy|sell|hold)/i.test(t)) {
    const src = (source || '').toLowerCase();
    if (!SOURCE_WHITELIST.has(src)) return true;
  }

  // Junk domain check from URL
  try {
    const hostname = new URL(url || '').hostname.toLowerCase();
    for (const junk of JUNK_DOMAINS) {
      if (hostname.includes(junk)) return true;
    }
  } catch { /* ignore invalid URLs */ }

  return false;
}

// --- Layer 4: Title similarity dedup ---
// Remove articles whose titles are very similar (same story from multiple outlets).
function dedupeByTitle(items) {
  const out = [];
  const seen = new Set();

  for (const item of items) {
    // Normalize title: lowercase, remove non-alphanumerics, collapse spaces
    const normalized = (item.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .slice(0, 6) // compare first 6 words
      .join(' ');

    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(item);
  }

  return out;
}

function isoDateDaysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// --- HTTP client, with optional HTTPS_PROXY support (requires Node 22 with --experimental-fetch + proxy,
// or falls back to node:https with an HttpsProxyAgent if available).
async function fetchJson(url, { headers } = {}) {
  const proxy = env.HTTPS_PROXY || env.https_proxy;
  if (proxy) {
    // Lightweight proxy-aware fetch using node:https + HttpsProxyAgent when installed.
    try {
      const { HttpsProxyAgent } = await import('https-proxy-agent');
      const agent = new HttpsProxyAgent(proxy);
      // Node 18+ built-in fetch does not support agent natively; use https.request instead.
      return await httpsGetJsonViaProxy(url, headers, agent);
    } catch {
      console.warn('[fetch-news] ⚠ HTTPS_PROXY set but https-proxy-agent not installed; trying direct fetch. npm i -D https-proxy-agent if needed.');
    }
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function httpsGetJsonViaProxy(url, headers, agent) {
  const https = await import('node:https');
  const { URL } = await import('node:url');
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: 'GET',
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        headers,
        agent,
      },
      (res) => {
        let chunks = '';
        res.setEncoding('utf8');
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(chunks);
            resolve(json);
          } catch (err) {
            reject(new Error(`Invalid JSON: ${chunks.slice(0, 200)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function runQuery({ q, category }) {
  const days = parseInt(env.NEWS_FETCH_DAYS || '1', 10);
  const from = isoDateDaysAgo(Math.max(1, days));
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&from=${from}&sortBy=publishedAt&pageSize=50&language=en`;
  const json = await fetchJson(url, {
    headers: { 'X-Api-Key': API_KEY, 'User-Agent': 'ai-musk-daily/1.0' },
  });
  if (json.status !== 'ok') throw new Error(`NewsAPI status=${json.status} message=${json.message || ''}`);
  return (json.articles || []).map((a) => ({
    raw: a,
    category,
  }));
}

function dedupe(articles) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const url = (a.raw.url || '').trim();
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(a);
  }
  return out;
}

function buildItem(a, idx) {
  const title = (a.raw.title || '').replace(/\s+[-–|].{0,40}$/, '').trim();
  if (!title || title.toLowerCase() === '[removed]') return null;

  // Layer 2: title blacklist check
  if (isJunkTitle(title, a.raw.url, a.raw.source?.name)) return null;

  // Layer 1: source whitelist check
  const source = a.raw.source && typeof a.raw.source === 'object' ? a.raw.source.name || null : a.raw.source;
  const sourceLower = (source || '').toLowerCase();
  if (!SOURCE_WHITELIST.has(sourceLower)) return null;

  const category = a.category;
  const company = category === 'musk' ? pickCompany(title) : null;
  const topic = pickTopic(title);

  // Layer 3: Relaxed TopNews rules
  // Tier-A sources + any Musk company or AI topic keyword → topNews
  const TIER_A_SOURCES = new Set([
    'reuters', 'bloomberg', 'the information', 'financial times',
    'techcrunch', 'the verge', 'wired', 'ars technica', 'bbc news',
    'cnbc', 'the new york times', 'the guardian', 'washington post',
    'axios', 'politico', 'associated press', 'mit technology review',
    'venturebeat', 'electrek', 'teslarati',
  ]);
  const isTierA = TIER_A_SOURCES.has(sourceLower);
  const hasStrongKeyword = /break(ing)?|announce|unveil|launch|major|landmark|milestone|record|first|deal|acquir|billion|ipo|funding/.test(title.toLowerCase());
  const topNews = isTierA && (hasStrongKeyword || company || category === 'ai');

  return {
    id: `newsapi-${Date.now()}-${idx}`,
    title,
    summary: a.raw.description || '',
    url: a.raw.url,
    source: source || 'Unknown',
    publishedAt: a.raw.publishedAt || new Date().toISOString(),
    imageUrl: a.raw.urlToImage || null,
    category,
    company,
    topic,
    topNews,
  };
}

async function main() {
  fs.mkdirSync(dataDir, { recursive: true });

  console.log(`[fetch-news] Running ${QUERIES.length} queries against newsapi.org…`);
  const allRaw = [];
  for (const q of QUERIES) {
    try {
      console.log(`  · q="${q.q.slice(0, 60)}" (category=${q.category})`);
      const batch = await runQuery(q);
      console.log(`    ↳ ${batch.length} articles`);
      allRaw.push(...batch);
    } catch (err) {
      console.error(`    ↳ ❌ ${err.message}`);
    }
  }

  // URL dedup
  const unique = dedupe(allRaw);
  console.log(`\n[filter] After URL dedup: ${unique.length} articles`);

  // Build items (Layers 1-3 applied inside buildItem)
  const built = unique
    .map((a, i) => buildItem(a, i))
    .filter(Boolean)
    .sort((x, y) => (x.publishedAt < y.publishedAt ? 1 : -1));
  console.log(`[filter] After source whitelist + title blacklist: ${built.length} articles`);

  // Layer 4: Title similarity dedup
  const items = dedupeByTitle(built);
  console.log(`[filter] After title dedup: ${items.length} articles`);

  // Pick top news
  const top = items.filter((it) => it.topNews).slice(0, 5);
  for (const it of top) it.topNews = true;
  // Fallback: if fewer than 3 topNews, promote latest items
  if (top.length < 3) {
    const needed = 3 - top.length;
    const candidates = items.filter((it) => !it.topNews).slice(0, needed);
    for (const it of candidates) it.topNews = true;
  }

  const payload = {
    date: todayISO(),
    fetchedAt: new Date().toISOString(),
    source: 'newsapi.org',
    items,
  };

  const outPath = path.join(dataDir, `news-${payload.date}.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`\n[fetch-news] ✅ Wrote ${items.length} articles to ${path.relative(projectRoot, outPath)}`);
  console.log(`  · AI items:       ${items.filter((i) => i.category === 'ai').length}`);
  console.log(`  · Musk items:     ${items.filter((i) => i.category === 'musk').length}`);
  console.log(`  · Top headlines:  ${items.filter((i) => i.topNews).length}`);
  console.log(`  · With images:   ${items.filter((i) => i.imageUrl).length}`);
}

main().catch((err) => {
  console.error('[fetch-news] ❌ Failed:', err);
  process.exit(1);
});
