# Technical Architecture - AI & Elon Musk Daily News

## 1. 架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions (UTC 14:00)                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  .github/workflows/daily-fetch-news.yml                      │   │
│  │    ├─ checkout → npm install → npm run fetch-news            │   │
│  │    ├─ 调 NewsAPI → 4层过滤 → 百度翻译                         │   │
│  │    └─ git commit + push (自动触发 Vercel 部署)               │   │
│  └────────────────────────────┬─────────────────────────────────┘   │
│                               │                                      │
│                               ▼                                      │
│                    src/data/news-YYYY-MM-DD.json                     │
│                    (含 titleZh / summaryZh 翻译字段)                  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ git push 触发
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Vercel (CDN)                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  React 18 + Vite SPA (纯静态，零服务端)                       │   │
│  │                                                              │   │
│  │  数据流：                                                     │   │
│  │  loadNews.js → import.glob news-*.json → 按日期过滤          │   │
│  │  → LangContext (EN/CN 切换) → 组件渲染                        │   │
│  │                                                              │   │
│  │  外部依赖：                                                   │   │
│  │  - Google Analytics 4 (G-Q30Z9MQ650)                         │   │
│  │  - NewsAPI.org (仅构建时使用，运行时不调用)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

**核心原则**：线上是纯静态站点。所有数据抓取、过滤、翻译动作在 GitHub Actions 中完成，通过 git push 将 JSON 推入仓库后由 Vercel 自动部署。零运维、零成本、API key 不泄露。

---

## 2. 技术栈

### 2.1 前端

| 技术 | 版本 | 作用 |
|------|------|------|
| **React** | 18.3 | UI 框架 |
| **Vite** | 5.4 | 构建工具 |
| **Tailwind CSS** | 3.4 | 原子化样式 |
| **Lucide React** | 0.447 | 线性图标库 |

### 2.2 数据脚本（fetch-news.mjs）

| 技术/模块 | 作用 |
|-----------|------|
| **Node.js** | >= 18，运行 ESM 脚本 |
| **原生 fetch** | 调用 NewsAPI 和百度翻译 API |
| **https-proxy-agent** | 可选代理支持（HTTPS_PROXY 环境变量） |
| **node:crypto** | MD5 签名计算（百度翻译签名） |
| **dotenv（内嵌）** | 自实现的轻量 `.env` 解析器 |

### 2.3 翻译服务

| 服务 | 说明 |
|------|------|
| **百度翻译 API** | 通用文本翻译（en -> zh），用于 titleZh / summaryZh 字段生成 |

### 2.4 部署与自动化

| 服务 | 说明 |
|------|------|
| **GitHub Actions** | cron 定时任务（每天 UTC 14:00）+ 手动触发 |
| **Vercel** | 自动部署（git push 后触发重新构建） |
| **Google Analytics 4** | 流量分析（Measurement ID: G-Q30Z9MQ650） |

---

## 3. 目录结构

```
AI-and-Elon Musk-Companies-NEWS/
├── .github/
│   └── workflows/
│       └── daily-fetch-news.yml      # 每日自动拉取+翻译+提交
├── src/
│   ├── main.jsx                      # 应用入口
│   ├── App.jsx                       # 主组件：路由、SEO meta、GA4
│   ├── index.css                     # Tailwind 指令 + 全局深色主题
│   ├── i18n.js                       # EN/CN 双语字典（t() 函数）
│   ├── components/
│   │   ├── Navbar.jsx                # Logo + 搜索框 + LangToggle
│   │   ├── Hero.jsx                  # DAILY BRIEF 头条区（1 BigCard + 2 SmallCard）
│   │   ├── TabFilter.jsx             # Today/Week tab + Category/Company/Topic 下拉筛选
│   │   ├── NewsSection.jsx           # 新闻分区容器（AI Industry / Musk Companies）
│   │   ├── NewsCard.jsx              # 单条新闻卡片（缩略图+边条+标题摘要+来源日期+链接）
│   │   ├── TagPill.jsx               # 分类标签胶囊组件
│   │   ├── LangToggle.jsx            # EN/CN 语言切换按钮
│   │   ├── BackToTop.jsx             # 回到顶部悬浮按钮
│   │   └── Drawer.jsx                # [已废弃] 保留文件但不再使用
│   ├── context/
│   │   └── LangContext.jsx           # React Context 管理 EN/CN 语言状态
│   ├── data/                         # 每日新闻 JSON（自动生成）
│   │   ├── news-2026-06-13.json
│   │   ├── news-2026-06-12.json
│   │   └── ...
│   └── utils/
│       ├── loadNews.js               # 动态 import() 读取 news-*.json，按日期过滤
│       └── constants.js              # 公司列表、主题列表、颜色常量定义
├── scripts/
│   └── fetch-news.mjs                # 核心脚本：NewsAPI → 过滤 → 百度翻译 → 写 JSON
├── index.html                        # HTML 入口（含 SEO meta 标签）
├── package.json
├── vite.config.js
├── tailwind.config.js                # 自定义颜色系统
├── postcss.config.js
├── .env.example                      # 环境变量模板
└── .gitignore
```

---

## 4. 数据模型

### 4.1 文件结构（news-YYYY-MM-DD.json）

```jsonc
{
  "date": "2026-06-13",
  "fetchedAt": "2026-06-13T06:43:58.425Z",
  "source": "newsapi.org",
  "items": [
    {
      "id": "newsapi-1781333024331-96",
      "title": "SpaceX's IPO brings Elon Musk closer to becoming the world's first trillionaire",
      "summary": "Elon Musk, already the world's richest man...",
      "url": "https://www.businessinsider.com/spacex-ipo-elon-musk-net-worth-trillionaire-2026-6",
      "source": "Business Insider",
      "publishedAt": "2026-06-12T02:57:13Z",
      "imageUrl": "https://i.insider.com/6a2b0bc26588b2a09a7c6d63?width=1200&format=jpeg",
      "category": "musk",              // "ai" | "musk"
      "company": "SpaceX",             // category=musk 时填写
      "topic": "Other",                // 主题 tag
      "topNews": true,                 // 是否头条
      "titleZh": "SpaceX的首次公开募股使埃隆·马斯克更接近成为世界上第一位亿万富翁",
      "summaryZh": "埃隆·马斯克已经是世界上最富有的人..."
    }
  ]
}
```

### 4.2 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识，格式 `newsapi-{timestamp}-{idx}` |
| `title` | string | 是 | 英文原始标题 |
| `summary` | string | 建议 | 英文原始摘要（来自 NewsAPI description） |
| `url` | string | 是 | 原文链接 |
| `source` | string | 是 | 媒体来源名称 |
| `publishedAt` | string | 是 | ISO 8601 时间 |
| `imageUrl` | string/null | 否 | 封面图 URL（来自 NewsAPI urlToImage） |
| `category` | string | 是 | `ai` 或 `musk` |
| `company` | string/null | 条件必填 | category=musk 时填：Tesla / SpaceX / X / Neuralink / The Boring Company / xAI / Starlink / Other |
| `topic` | string | 是 | LLMs / Multimodal / Agents / Robotics / Autonomous / Chips / Policy / Funding & M&A / Product Launch / Research / Other |
| `topNews` | boolean | 否 | 是否在 Hero 头条区展示 |
| `titleZh` | string/null | 否 | 百度翻译的中文标题 |
| `summaryZh` | string/null | 否 | 百度翻译的中文摘要 |

---

## 5. 脚本逻辑（scripts/fetch-news.mjs）

### 5.1 完整执行流程（8 步）

```
步骤 1: 加载环境变量（.env.local / .env / process.env）
        - 校验 NEWS_API_KEY 是否存在
        - 读取可选配置：HTTPS_PROXY、BAIDU_APP_ID、BAIDU_SECRET_KEY

步骤 2: 构造多轮查询（3 组关键词）
        Q1: ai OR artificial intelligence OR llm OR agents          → category=ai
        Q2: "generative ai" OR "machine learning" OR "foundation model" → category=ai
        Q3: tesla OR "elon musk" OR spacex OR neuralink OR xAI ...  → category=musk

步骤 3: 调用 NewsAPI /v2/everything
        - sortBy=publishedAt, language=en, from=今天-N天
        - 支持 HTTPS_PROXY（通过 https-proxy-agent）
        - 每组查询最多返回 50 条

步骤 4: Layer 0 — URL 去重
        - 按 url 字段去重，同一 URL 只保留一条

步骤 5: Layer 1 — 来源白名单过滤
        - 仅保留白名单内的媒体（Tier 1~4 共 50+ 家）
        - 排除垃圾域名（pypi/npm/youtube/reddit 等）

步骤 6: Layer 2 — 标题黑名单过滤
        - 过短标题（<25字符）
        - 版本号模式（非发布类）
        - 纯股票分析类（非白名单来源时）

步骤 7: 打标签 + Layer 3 — TopNews 标记
        - company/topic 基于标题关键词匹配
        - topNews 规则：Tier-A 来源 AND (强关键词 OR Musk公司 OR AI分类)
        - 不足 3 条时自动从最新文章补齐

步骤 8: Layer 4 — 标题相似度去重
        - 取标题前 6 词做归一化比较
        - 相同归一化标题只保留一条

步骤 9: 百度翻译（可选）
        - 批量将 title + summary 合并为一次 API 调用
        - 内置指数退避重试（最多 3 次，间隔 2s/4s）
        - 请求间间隔 1.5s（避免频率限制）
        - 结果拆分写入 titleZh / summaryZh 字段

步骤 10: 写入 src/data/news-YYYY-MM-DD.json
         - 输出统计：总数 / AI数 / Musk数 / 头条数 / 有图数 / 翻译数
```

### 5.2 运行方式

```bash
# 本地手动运行
npm run fetch-news

# GitHub Actions 自动运行（每天 UTC 14:00）
# 支持 workflow_dispatch 手动触发
```

---

## 6. 前端数据读取逻辑（utils/loadNews.js）

```
- 使用 import.meta.glob('./data/news-*.json', { eager: false }) 动态导入
- 自动扫描 src/data/ 下所有匹配文件
- 按日期倒序排列，默认加载最近数据
- 合并成统一数组交给组件渲染
- 显示最新更新时间 = 最新 JSON 的 fetchedAt
- Tab "Today" = 仅显示当天
- Tab "This Week" = 显示最近 7 天
```

**语言切换机制**：
- `LangContext.jsx` 通过 React Context 提供 `lang` 状态（'en' | 'zh'）
- 组件通过 `i18n.js` 的 `t(key, params, lang)` 获取对应语言文案
- CN 模式下优先展示 `titleZh` / `summaryZh`，回退到英文原文
- 公司名和话题名也有独立翻译映射（`tCompany()` / `tTopic()`）

---

## 7. UI 组件分工

| 组件 | 职责 | 关键特性 |
|------|------|----------|
| `Navbar` | Logo、搜索框、LangToggle 按钮 | 固定顶部，搜索框实时响应 |
| `Hero` | DAILY BRIEF 头条区 | 杂志风格布局：1 张 BigCard + 2 张 SmallCard，全屏图片 + overlay 文字 |
| `TabFilter` | Today/This Week tab + 三组下拉筛选器 | Category / Company / Topic 多维度组合筛选 |
| `NewsSection` | 分区容器 | AI Industry 和 Musk Companies 两个分区，各自带提示文案 |
| `NewsCard` | 单条新闻卡片 | 左侧缩略图 + 彩色分类边条 + 标题/摘要(line-clamp-2) + 来源/日期 + Read original 链接 |
| `TagPill` | 分类标签胶囊 | 根据 category/company/topic 渲染不同颜色 |
| `LangToggle` | EN/CN 语言切换 | 点击即切换全局语言状态 |
| `BackToTop` | 回到顶部悬浮按钮 | 滚动超过阈值后出现，点击平滑滚动到顶部 |
| `Drawer` | ~~右侧详情抽屉~~ | 已废弃，不再使用 |

### 颜色系统（tailwind.config.js 自定义）

```js
colors: {
  bg: {
    DEFAULT: '#0B1220',     // 深空蓝（主背景）
    soft: '#111B2E',        // 次级背景
  },
  accent: '#00E5FF',         // 电光青（强调色、AI 区）
  musk: '#E11D48',           // 马斯克红（Musk 区强调色）
  surface: '#1A2340',        // 卡片表面
  text: {
    primary: '#F1F5F9',      // 主文字
    secondary: '#94A3B8',    // 次要文字
  }
}
```

---

## 8. 响应式设计

Tailwind 默认断点：

| 断点 | 宽度 | 布局 |
|------|------|------|
| `sm` | >= 640px | 手机横屏 / 小平板 |
| `md` | >= 768px | 平板 — Hero 小卡并排，新闻卡 2 列 |
| `lg` | >= 1024px | 笔记本 — Hero 大卡+双小卡完整布局，新闻卡 3 列 |
| `xl` | >= 1280px | 大屏 — 更宽留白 |

移动端策略：
- Hero 区改为堆叠式垂直排列
- 搜索框保持可见
- Tab 筛选横向可滚动

---

## 9. 全自动化维护工作流

项目已实现**全自动**运行，无需人工干预：

```
每天 UTC 14:00（北京时间 22:00）：

  GitHub Actions 自动触发
    ├─ Checkout 代码
    ├─ 安装依赖（npm install，带缓存）
    ├─ 运行 fetch-news.mjs
    │   ├─ 调 NewsAPI（3 组查询）
    │   ├─ 4 层过滤（URL去重 → 白名单 → 黑名单 → 标题去重）
    │   ├─ 打标签 + TopNews 标记
    │   ├─ 百度翻译（titleZh + summaryZh）
    │   └─ 写入 news-YYYY-MM-DD.json
    ├─ Git commit + push（仅在有变更时）
    └─ Vercel 自动检测 push → 重新构建 → 部署上线

总耗时约 2~5 分钟（主要耗时在百度翻译的串行请求上）
```

**手动操作入口**：
- GitHub Actions 页面 > Daily Fetch News > Run workflow
- 本地：`npm run fetch-news` 然后 `git add && git commit && git push`

---

## 10. SEO 与 Analytics

### SEO 配置（index.html / App.jsx）

- Open Graph 标签（og:title, og:description, og:image, og:url）
- Twitter Card 标签（twitter:card, twitter:title, twitter:description）
- Canonical URL
- Semantic HTML 结构（header, main, section, article, footer）

### Google Analytics 4

- Measurement ID: `G-Q30Z9MQ650`
- 通过 gtag.js 异步加载，不影响首屏性能

---

## 11. 风险与应对措施

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| NewsAPI 免费额度耗尽（100 次/天） | 当日无法拉取新闻 | 3 组查询共 3 次请求，远低于限额；升级 Pro($10/月)可扩容 |
| 百度翻译频率限制（免费版 QPS 限制） | 部分新闻缺少中文翻译 | 内置指数退避重试(3次)；每条间隔 1.5s；批量合并 title+summary 为单次请求减半调用量 |
| 百度翻译月额度用完（免费版有限制） | 新增新闻无中文 | 翻译失败时保留英文原文，CN 模式下回退显示；升级付费版或换用其他翻译 API |
| 百度翻译敏感词过滤 | 某些内容被拒翻 | catch 错误后跳过该条，保留英文原文 |
| HTTPS_PROXY 不稳定导致脚本失败 | Actions 环境中拉取失败 | GitHub Actions 运行在 ubuntu-latest，通常无需代理；本地开发时可配置 |
| NewsAPI 返回低质量/重复内容 | 用户体验差 | 4 层过滤链（URL去重→白名单→黑名单→标题相似度去重）大幅降低噪声 |
| 同一事件多家媒体报道导致重复 | 信息冗余 | Layer 4 标题相似度去重（前 6 词归一化比较） |
| GitHub Actions 运行失败 | 当日无新数据 | 失败时有日志输出；支持手动 re-run 或 workflow_dispatch 触发 |
| Vercel 构建失败 | 网站无法更新 | 检查 build log；通常是代码语法问题而非数据问题（JSON 不参与构建） |

---

## 12. 项目状态

本项目已完成全部核心功能开发和部署：

- [x] React 18 + Vite + Tailwind CSS 前端框架搭建
- [x] 杂志风格 Hero 布局（大卡 + 双小卡）
- [x] 新闻卡片组件（缩略图、彩色边条、摘要截断）
- [x] 多维度筛选（时间 / 分类 / 公司 / 话题）
- [x] 实时搜索功能
- [x] EN/CN 双语切换（UI + 新闻内容）
- [x] 入场动画效果
- [x] 百度翻译集成（titleZh / summaryZh）
- [x] 4 层新闻过滤管道
- [x] TopNews 自动标记规则
- [x] GitHub Actions 全自动化（每日 UTC 14:00）
- [x] Vercel 自动部署
- [x] SEO 优化（OG / Twitter Cards / canonical）
- [x] Google Analytics 4 接入
- [x] 深色主题（已移除浅色模式）
