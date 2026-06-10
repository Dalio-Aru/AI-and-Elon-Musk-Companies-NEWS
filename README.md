# AI & Elon Musk Daily News

> 一个每日更新的极简 Web 门户，聚合 **AI 行业** 与 **埃隆·马斯克旗下公司** 的最新新闻。

- ⚡ 前端：**React 18 + Vite + Tailwind CSS**
- 📰 数据源：[NewsAPI.org](https://newsapi.org)（也可手动写入 JSON）
- 🌓 深色 / 浅色主题切换
- 🔎 搜索、按分类/公司/主题筛选
- 📅 今日 / 最近一周切换

---

## 目录结构

```
.
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx             # 入口
│   ├── App.jsx              # 主应用
│   ├── index.css            # Tailwind + 全局样式
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── TabFilter.jsx
│   │   ├── NewsSection.jsx
│   │   ├── NewsCard.jsx
│   │   ├── TagPill.jsx
│   │   └── Drawer.jsx
│   ├── data/                # 每日新闻 JSON（由 fetch-news 脚本生成）
│   │   ├── news-2026-06-08.json
│   │   └── ...
│   └── utils/
│       ├── loadNews.js      # 动态读取 news-*.json
│       └── constants.js
└── scripts/
    └── fetch-news.mjs       # 调 NewsAPI，写入 src/data/news-YYYY-MM-DD.json
```

---

## 快速开始

### 1) 装 Node.js

需要 **Node.js ≥ 18**。去 <https://nodejs.org> 下载安装 LTS 版本（Windows 安装包即可），一路下一步。装完后在 PowerShell 里执行：

```powershell
node --version   # 例如 v20.18.0
npm --version    # 例如 10.8.2
```

### 2) 安装项目依赖

在项目根目录执行：

```powershell
cd "C:\Users\qq825\Desktop\MyProgram\AI-and-Elon Musk-Companies-NEWS"
npm install
```

### 3) 启动开发服务器

```powershell
npm run dev
```

浏览器访问终端打印的地址（通常是 <http://localhost:5173>）。你应该能看到首页 + Hero + 今日新闻列表——因为 `src/data/news-2026-06-08.json` 里已经塞了示例数据。

### 4) 生产构建

```powershell
npm run build    # 产物在 dist/
npm run preview  # 本地预览 dist/
```

---

## 如何接入真实新闻（NewsAPI.org）

1. 去 <https://newsapi.org/register> 注册，拿一个免费 API key。
2. 复制 `.env.example` 成 `.env.local`，然后把 key 填进去：

   ```
   NEWS_API_KEY=你的key写这里
   ```

   > 如果你的网络环境需要走代理才能访问 newsapi.org，再加一行：
   >
   > ```
   > HTTPS_PROXY=http://127.0.0.1:7890
   > ```
   > （脚本会尝试使用 `https-proxy-agent`，请先 `npm i -D https-proxy-agent`）

3. 拉取今天的新闻并写入 `src/data/news-YYYY-MM-DD.json`：

   ```powershell
   npm run fetch-news
   ```

4. 刷新浏览器即可看到新数据。

> **建议的日常流程**：每天早上跑一次 `npm run fetch-news` → commit → 部署。Vercel/Netlify 会自动重新构建。

---

## 数据字段说明

每条新闻（`items[]` 中的对象）：

| 字段 | 含义 | 必填 |
|------|------|------|
| `title` | 标题 | ✅ |
| `summary` | 摘要 / 描述 | 建议 |
| `url` | 原文链接 | ✅ |
| `source` | 媒体名称 | ✅ |
| `publishedAt` | ISO 时间，如 `2026-06-08T06:20:00Z` | ✅ |
| `category` | `ai` 或 `musk` | ✅ |
| `company` | 当 `category=musk` 时填写：`Tesla` / `SpaceX` / `X` / `Neuralink` / `The Boring Company` / `xAI` / `Starlink` / `Other` | 条件必填 |
| `topic` | `大模型` / `多模态` / `Agent` / `机器人` / `自动驾驶` / `芯片` / `政策` / `投资并购` / `产品发布` / `其他` | ✅ |
| `topNews` | `true` 表示显示在 Hero 头条区 | 可选 |
| `imageUrl` | 封面图（当前 MVP 未展示，但可留作后续扩展） | 可选 |

---

## 常见问题

**Q: 首页一片空白，控制台报错 `Failed to fetch dynamically imported module`？**
A: 说明 `src/data/` 下没有匹配 `news-*.json` 的文件。跑一次 `npm run fetch-news` 或手动放一个进去（文件名必须是 `news-YYYY-MM-DD.json`）。

**Q: NewsAPI 免费额度只有 100 次/天，不够用怎么办？**
A: 100 次/天已经够每天抓一次。可以升级 Pro（$10/月），或换成 RSS 源自己解析。

**Q: 想把它部署到网上？**
A: 直接推送 GitHub，然后在 [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com) 导入仓库，框架选 Vite，一键部署。`dist/` 就是静态站。

**Q: 能否接 AI 摘要能力？**
A: 架构上预留了——在 `scripts/fetch-news.mjs` 的 `buildItem()` 里，对每条新闻额外调一次 LLM API 即可把 `description` 替换成中文摘要。当前 MVP 为了省成本和时间没有接。

---

## 下一步的可选扩展

- [ ] 用 GitHub Actions + Secret + cron 自动每天跑一次 `fetch-news`
- [ ] 加图片封面（NewsAPI 返回的 `urlToImage`）
- [ ] 加"收藏"功能（localStorage）
- [ ] 邮件 / RSS 订阅每日摘要
- [ ] 接入 LLM 生成中文摘要
- [ ] 多语言（中/英切换）
