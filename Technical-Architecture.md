# 🛠 Technical Architecture - AI & Elon Musk Daily News

## 1. 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                          浏览器                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  React 18 + Vite (SPA)                                │ │
│  │  - 首页 Hero / 新闻卡 / 筛选 / 搜索                   │ │
│  │  - 读取 src/data/news-YYYY-MM-DD.json                 │ │
│  │  - 深色/浅色主题切换 (localStorage)                   │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (部署后)
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
   Vercel / Netlify        GitHub Pages         任何静态托管
   (纯静态文件，无服务端)
                               ▲
                               │
                               │ 开发 / 维护者本地
         ┌──────────────────────────────────────────┐
         │  你的电脑 (可走代理访问 newsapi.org)      │
         │                                          │
         │  scripts/fetch-news.mjs                  │
         │    ├─ 调用 NewsAPI /v2/everything        │
         │    ├─ 关键词: AI / Tesla / SpaceX / ...  │
         │    ├─ 去重 + 打 tag + 格式化             │
         │    └─ 写入 src/data/news-YYYY-MM-DD.json │
         │                                          │
         │  然后 git commit + push + deploy         │
         └──────────────────────────────────────────┘
                               ▲
                               │
                        NewsAPI.org (外部服务)
                        - 100 requests / day free
                        - 需要 API key (.env 管理，不进仓库)
```

**核心原则**：线上是纯静态站点，所有"数据抓取"动作只在你本地跑。这样线上零运维、零成本，API key 也不会泄露。

---

## 2. 技术栈

### 2.1 前端

| 技术 | 版本 | 作用 |
|------|------|------|
| **React** | 18 | UI 框架 |
| **Vite** | 最新稳定版 | 构建工具，速度快 |
| **TypeScript** | 5.x | 类型安全（可选，MVP 可用纯 JS）|
| **Tailwind CSS** | 3.x | 样式，便于快速搭出设计风格 |
| **Lucide React** | 最新 | 线性图标库 |
| **React Router** | 6.x | 如果要做"今日 / 本周"多页路由（否则不需要）|

### 2.2 本地数据脚本

| 技术 | 作用 |
|------|------|
| **Node.js** | ≥18，跑脚本 |
| **`node-fetch` / 原生 `fetch`** | 调 NewsAPI |
| **dotenv** | 管理 API key（`.env.local`，不进 git）|
| **dayjs** | 日期处理（归档分组） |

### 2.3 部署

- **Vercel** / **Netlify** / **GitHub Pages** 三选一即可，零配置

---

## 3. 目录结构

```
AI-and-Elon Musk-Companies-NEWS/
├── .trae/
│   └── skills/
│       └── frontend-design/
│           └── SKILL.md
├── PRD.md
├── Technical-Architecture.md       ← (本文件)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
├── .env.example                     ← 模板，示范 NEWS_API_KEY=xxx
│
├── src/
│   ├── main.jsx                     ← 入口
│   ├── App.jsx                      ← 主应用，路由 + 主题
│   ├── index.css                    ← Tailwind + 全局样式
│   │
│   ├── components/
│   │   ├── Navbar.jsx               ← 顶部导航 + 搜索框 + 主题切换
│   │   ├── Hero.jsx                 ← 今日日期 + 状态灯 + TOP 头条
│   │   ├── NewsSection.jsx          ← 新闻分区 (AI / Musk Companies)
│   │   ├── NewsCard.jsx             ← 单条新闻卡
│   │   ├── TagPill.jsx              ← 胶囊 tag
│   │   ├── TabFilter.jsx            ← 今日 / 本周 tab
│   │   └── Drawer.jsx               ← 右侧详情抽屉
│   │
│   ├── data/                        ← 新闻数据（由脚本自动生成）
│   │   ├── news-2026-06-05.json     ← 每天一个文件（最近 7 天保留）
│   │   ├── news-2026-06-06.json
│   │   └── news-2026-06-07.json
│   │
│   └── utils/
│       ├── loadNews.js              ← 动态 import() 读取最近 7 天 JSON
│       ├── filter.js                ← 搜索 + 按 tag 筛选逻辑
│       └── constants.js             ← 公司列表 / 主题列表 / 颜色
│
└── scripts/
    ├── fetch-news.mjs               ← 每日拉取 NewsAPI 并写 JSON
    └── cleanup.mjs                  ← 删除超过 7 天的旧 JSON（可选）
```

---

## 4. 数据模型（News Item）

每条新闻在 JSON 里是这样的结构：

```jsonc
// src/data/news-2026-06-07.json
{
  "date": "2026-06-07",
  "fetchedAt": "2026-06-07T09:12:00+08:00",
  "source": "newsapi.org",
  "items": [
    {
      "id": "newsapi-abc123",
      "title": "Tesla pushes FSD v13.5 Beta to wider North American fleet",
      "summary": "Elon Musk announced on X that FSD v13.5 has started rolling out, focusing on improved urban left turns and pedestrian detection.",
      "url": "https://example.com/tesla-fsd-v13-5",
      "source": "Electrek",
      "publishedAt": "2026-06-07T04:20:00Z",
      "imageUrl": null,
      "category": "musk",        // "ai" | "musk"
      "company": "Tesla",        // 当 category === "musk"
      "topic": "自动驾驶",         // 主题 tag
      "topNews": true            // 是否头条（Hero 区用）
    }
    // ... 更多
  ]
}
```

**字段说明**：

| 字段 | 含义 | 必填 |
|------|------|------|
| `category` | `ai` 或 `musk`，用于区分两大区域 | 是 |
| `company` | 当 `category === musk` 时填：Tesla / SpaceX / X / Neuralink / Boring Co / xAI / Starlink / Other | 条件必填 |
| `topic` | 主题 tag：大模型 / 多模态 / Agent / 机器人 / 自动驾驶 / 芯片 / 政策 / 投资并购 / 其他 | 是 |
| `topNews` | 是否作为头条显示在 Hero（脚本基于简单规则自动标记，也可人工改）| 否 |

---

## 5. 脚本 `scripts/fetch-news.mjs` 的逻辑

```
步骤 1: 读取 .env.local 里的 NEWS_API_KEY
步骤 2: 构造多轮查询 ——
        q="Tesla" OR "Elon Musk" OR "SpaceX" ...
        q="AI" OR "OpenAI" OR "Claude" OR "GPT" ...
步骤 3: 调 https://newsapi.org/v2/everything
        - sortBy=publishedAt
        - language=en (或 + zh)
        - from=今天
步骤 4: 合并 + 去重（按 url）
步骤 5: 打 tag (category / company / topic)
        - 基于标题关键词简单匹配
        - 例如标题含 Tesla → company=Tesla, category=musk
        - 标题含 GPT / Claude → topic=大模型, category=ai
步骤 6: 标记 topNews（脚本简单规则：来自主流媒体 + 标题含 CEO/发布/重大版本）
步骤 7: 写入 src/data/news-YYYY-MM-DD.json
步骤 8: 打印 "✅ 已写入 N 条新闻"
```

**运行方式**：
```bash
npm run fetch-news      # 拉取今天的新闻
```

**本地首次准备**：
```bash
cp .env.example .env.local
# 然后编辑 .env.local，填入 NEWS_API_KEY=你的key
```

---

## 6. 前端读取数据的逻辑（`utils/loadNews.js`）

```
- 用 import.meta.glob('./data/news-*.json', { eager: true })
- 自动拿到 src/data/ 目录下所有新闻 JSON
- 按日期倒序，取最近 7 天
- 合并成一个大数组，交给组件渲染
- 顶部显示 "最新更新时间" = 最新那份 JSON 的 fetchedAt
- Tab "今日" = 只显示当天
- Tab "本周" = 显示最近 7 天
```

> 这样做的好处：**你完全不需要改任何代码就能更新内容**，只要跑 `npm run fetch-news` 然后 commit，页面就会自动读取新的 JSON。

---

## 7. UI 组件分工（与 PRD 对应）

| 组件 | 职责 | 与 PRD 的对应 |
|------|------|--------------|
| `Navbar` | Logo、搜索输入框、主题切换按钮 | 顶部导航栏 |
| `Hero` | 大号日期 + "Last updated" 状态灯 + 3 张头条卡 | Hero 区 |
| `TabFilter` | 今日 / 本周 tab 切换 + 公司 / 主题下拉筛选 | 分类筛选 |
| `NewsSection` + `NewsCard` | 分两栏（AI 区 / Musk 公司区）展示新闻卡片 | AI/马斯克新闻区 |
| `Drawer` | 点击卡片 → 右侧滑出详情 + "Read original ↗" 按钮 | 新闻详情视图 |

**颜色系统（Tailwind 自定义）**：

```js
// tailwind.config.js
colors: {
  bg: {
    DEFAULT: '#0B1220',      // 深空蓝
    soft: '#111B2E',
  },
  accent: '#00E5FF',          // 电光青
  musk: '#E11D48',            // 马斯克红
  surface: '#1A2340',
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
  }
}
```

---

## 8. 响应式断点

Tailwind 默认断点直接用：

```
sm  ≥ 640px   手机横屏 / 小平板
md  ≥ 768px   平板 — 新闻卡 2 列
lg  ≥ 1024px  笔记本 — 新闻卡 3 列
xl  ≥ 1280px  大屏 — 3 列 + 更宽留白
```

**移动端策略**：
- Hero 区改为堆叠式
- 搜索框折叠成 🔍 图标，点击展开输入框
- Tab 筛选横向可滚动

---

## 9. 每日维护工作流（给你看的操作手册）

```
每天早上（或你想更新的时间）：

1. cd 到项目目录
2. npm run fetch-news           ← 拉新闻 + 写 JSON
3. git add src/data/
4. git commit -m "news: 2026-06-07"
5. git push                     ← 自动触发 Vercel/Netlify 重部署
6. 30 秒后刷新网站看到新内容 ✅
```

**未来扩展（v2）**：
- 用 GitHub Actions + Secret 把这个流程搬到云端，你连电脑都不用开

---

## 10. 风险与注意事项

| 风险 | 影响 | 对策 |
|------|------|------|
| NewsAPI 免费额度用完（100次/天） | 拉不到新闻 | 脚本里加缓存；真不够用就升级 Pro ($10/月) |
| 你的代理不稳定导致脚本失败 | 拉不到新闻 | 脚本里加重试 + 失败时留空 JSON，下次再跑 |
| NewsAPI 返回的 description 太简短 | 内容不够看 | MVP 先忍；v2 上 AI 摘要 |
| 数据里出现重复新闻 | 体验差 | 脚本按 `url` 去重 |
| 某条新闻是假/低质量来源 | 内容质量 | 脚本加"白名单媒体"过滤（BBC、Reuters、TechCrunch 等）|
| 中文读者看不懂英文标题 | 本地化问题 | MVP 暂缓；v2 加 AI 翻译或切换到中文源 |

---

## 11. 下一步

如果这份架构 OK，进入代码实现阶段的交付清单：

1. ✅ 初始化 Vite + React + Tailwind 项目
2. ✅ 写 `scripts/fetch-news.mjs`（含 `.env.example`）
3. ✅ 搭组件骨架（Navbar / Hero / NewsCard / Drawer 等）
4. ✅ 写数据读取与筛选工具函数
5. ✅ 接入深色主题 + 响应式
6. ✅ 跑一次 fetch-news 验证数据流
7. ✅ 提交一份 README 说明部署步骤

---

> **请审阅本文件**。有任何想调整的（技术选型 / 数据字段 / UI 风格 / 脚本逻辑），告诉我你的想法；确认无误后我进入代码实现。
