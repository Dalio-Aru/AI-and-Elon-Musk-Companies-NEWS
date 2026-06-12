// src/i18n.js — EN / CN translation dictionary

const dict = {
  en: {
    // Navbar
    navTitle: 'AI & Musk News',
    navSubtitle: 'daily brief',
    navSearch: 'Search news by title, source…',

    // Lang toggle
    langEn: 'EN',
    langCn: 'CN',

    // Hero
    heroLabel: 'DAILY BRIEF',
    heroTitle: "AI & Elon Musk — Daily News",
    heroDesc: "One place for the latest in AI and all of Elon Musk's companies: Tesla, SpaceX, X, Neuralink, The Boring Company, xAI and Starlink.",
    heroUpdated: 'Last updated',
    heroLoading: 'Loading…',
    heroNoTopStories: 'No top stories yet.',
    heroRunFetch: 'to pull today\'s news.',
    heroFillSidebar: 'Add more top stories to fill the sidebar.',

    // Tabs
    tabToday: 'Today',
    tabWeek: 'This Week',

    // Filters
    filterCategory: 'Category',
    filterCompany: 'Company',
    filterTopic: 'Topic',
    filterAll: 'All',
    filterAllCompanies: 'All companies',
    filterAllTopics: 'All topics',
    filterAI: 'AI',
    filterMusk: 'Musk companies',

    // Sections
    sectionAi: 'AI Industry',
    sectionAiHint: 'Models, agents, chips, policy, research.',
    sectionMusk: "Elon Musk's Companies",
    sectionMuskHint: 'Tesla, SpaceX, X, Neuralink, The Boring Company, xAI, Starlink.',
    itemsCount: '{count} items',
    noItemsInSection: 'No items in this section for the selected date range.',

    // Search
    searchResults: 'Search Results',
    searchingFor: 'Searching for "{q}" — {count} result{plural}',
    clearSearch: 'Clear',
    noResultsFound: 'No results found.',
    tryDifferentKeywords: 'Try different keywords or check your spelling.',

    // Empty state (browse mode)
    noNewsMatching: 'No news matching your filters.',
    tryWidening: 'Try widening the date range, clearing the search, or run',
    toRefreshData: 'to refresh the data.',

    // News card
    unknownSource: 'Unknown source',
    unknown: 'Unknown',

    // Footer
    footer: 'Built with React + Vite + Tailwind · Data from NewsAPI.org · © {year}',

    // Top story labels
    aiTopStory: 'AI TOP STORY',
    muskTopStoryPrefix: 'TOP STORY',

    // Company names (for filter dropdowns)
    companyTesla: 'Tesla',
    companySpaceX: 'SpaceX',
    companyX: 'X',
    companyNeuralink: 'Neuralink',
    companyBoring: 'The Boring Company',
    companyXai: 'xAI',
    companyStarlink: 'Starlink',
    companyOther: 'Other',

    // Topic names (for filter dropdowns)
    topicLlms: 'LLMs',
    topicMultimodal: 'Multimodal',
    topicAgents: 'Agents',
    topicRobotics: 'Robotics',
    topicAutonomous: 'Autonomous',
    topicChips: 'Chips',
    topicPolicy: 'Policy',
    topicFunding: 'Funding / M&A',
    topicProductLaunch: 'Product Launch',
    topicResearch: 'Research',
    topicOther: 'Other',
  },

  zh: {
    // Navbar
    navTitle: 'AI 与马斯克新闻',
    navSubtitle: '每日简报',
    navSearch: '搜索新闻标题、来源…',

    // Lang toggle
    langEn: 'EN',
    langCn: 'CN',

    // Hero
    heroLabel: '每日简报',
    heroTitle: 'AI 与埃隆·马斯克 — 每日新闻',
    heroDesc: '一站式获取 AI 及埃隆·马斯克旗下所有公司最新动态：特斯拉、SpaceX、X、Neuralink、The Boring Company、xAI 和 Starlink。',
    heroUpdated: '最后更新于',
    heroLoading: '加载中…',
    heroNoTopStories: '暂无头条新闻。',
    heroRunFetch: '运行',
    heroFillSidebar: '添加更多头条以填充侧栏。',

    // Tabs
    tabToday: '今日',
    tabWeek: '本周',

    // Filters
    filterCategory: '分类',
    filterCompany: '公司',
    filterTopic: '话题',
    filterAll: '全部',
    filterAllCompanies: '全部公司',
    filterAllTopics: '全部话题',
    filterAI: 'AI',
    filterMusk: '马斯克公司',

    // Sections
    sectionAi: 'AI 行业',
    sectionAiHint: '模型、智能体、芯片、政策、研究。',
    sectionMusk: '埃隆·马斯克旗下公司',
    sectionMuskHint: '特斯拉、SpaceX、X、Neuralink、The Boring Company、xAI、Starlink。',
    itemsCount: '{count} 条',
    noItemsInSection: '所选时间范围内该分区暂无内容。',

    // Search
    searchResults: '搜索结果',
    searchingFor: '正在搜索"{q}"——{count} 条结果',
    clearSearch: '清除',
    noResultsFound: '未找到结果。',
    tryDifferentKeywords: '请尝试其他关键词或检查拼写。',

    // Empty state (browse mode)
    noNewsMatching: '无匹配新闻。',
    tryWidening: '尝试扩大日期范围、清除搜索条件，或运行',
    toRefreshData: '来刷新数据。',

    // News card
    unknownSource: '未知来源',
    unknown: '未知',

    // Footer
    footer: '基于 React + Vite + Tailwind 构建 · 数据来自 NewsAPI.org · © {year}',

    // Top story labels
    aiTopStory: 'AI 头条',
    muskTopStoryPrefix: '头条',

    // Company names (for filter dropdowns)
    companyTesla: '特斯拉',
    companySpaceX: 'SpaceX',
    companyX: 'X（原 Twitter）',
    companyNeuralink: 'Neuralink',
    companyBoring: 'The Boring Company',
    companyXai: 'xAI',
    companyStarlink: 'Starlink',
    companyOther: '其他',

    // Topic names (for filter dropdowns)
    topicLlms: '大语言模型',
    topicMultimodal: '多模态',
    topicAgents: '智能体',
    topicRobotics: '机器人',
    topicAutonomous: '自动驾驶',
    topicChips: '芯片',
    topicPolicy: '政策法规',
    topicFunding: '融资/并购',
    topicProductLaunch: '产品发布',
    topicResearch: '研究进展',
    topicOther: '其他',
  },
};

/**
 * Get translation by key.
 * Supports simple interpolation: {key} in string will be replaced from params object.
 */
export function t(key, params = {}, lang = 'en') {
  const d = dict[lang] || dict.en;
  let text = d[key] ?? dict.en[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

/** Translate a company name (English key → localized label) */
const COMPANY_KEY_MAP = {
  Tesla: 'companyTesla',
  SpaceX: 'companySpaceX',
  X: 'companyX',
  Neuralink: 'companyNeuralink',
  'The Boring Company': 'companyBoring',
  xAI: 'companyXai',
  Starlink: 'companyStarlink',
  Other: 'companyOther',
};

const TOPIC_KEY_MAP = {
  LLMs: 'topicLlms',
  Multimodal: 'topicMultimodal',
  Agents: 'topicAgents',
  Robotics: 'topicRobotics',
  Autonomous: 'topicAutonomous',
  Chips: 'topicChips',
  Policy: 'topicPolicy',
  'Funding / M&A': 'topicFunding',
  'Product Launch': 'topicProductLaunch',
  Research: 'topicResearch',
  Other: 'topicOther',
};

export function tCompany(name, lang = 'en') {
  const key = COMPANY_KEY_MAP[name];
  return key ? t(key, {}, lang) : name;
}

export function tTopic(name, lang = 'en') {
  const key = TOPIC_KEY_MAP[name];
  return key ? t(key, {}, lang) : name;
}

export default dict;
