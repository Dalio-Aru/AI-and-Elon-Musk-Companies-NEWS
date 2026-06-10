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

const PUBLISHERS = new Set([
  'techcrunch', 'the verge', 'engadget', 'wired', 'ars technica',
  'reuters', 'bloomberg', 'the information', 'financial times',
  'bbc news', 'cnn', 'the new york times', 'the guardian',
  'electrek', 'teslarati', 'spacex', 'x blog', 'arstechnica',
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

  const category = a.category;
  const company = category === 'musk' ? pickCompany(title) : null;
  const topic = pickTopic(title);

  const source = a.raw.source && typeof a.raw.source === 'object' ? a.raw.source.name || null : a.raw.source;
  const topNews = /break(ing)?|announce|unveil|launch|major|landmark|milestone/.test(title.toLowerCase())
    && PUBLISHERS.has((source || '').toLowerCase());

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

  const unique = dedupe(allRaw);
  const items = unique
    .map((a, i) => buildItem(a, i))
    .filter(Boolean)
    .sort((x, y) => (x.publishedAt < y.publishedAt ? 1 : -1));

  // Pick top news: prefer items with topNews flag first, otherwise keep latest
  const top = items.filter((it) => it.topNews).slice(0, 3);
  for (const it of top) it.topNews = true;

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
  console.log(`  · Top headlines:  ${top.length}`);
}

main().catch((err) => {
  console.error('[fetch-news] ❌ Failed:', err);
  process.exit(1);
});
