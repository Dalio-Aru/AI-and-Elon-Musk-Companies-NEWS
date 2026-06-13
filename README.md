# AI & Elon Musk Daily News

每日更新的新闻门户，聚合 **AI 行业** 与 **埃隆·马斯克旗下公司** 的最新资讯，支持中英文一键切换。

在线地址：https://ai-and-elon-musk-companies-news.vercel.app/

---

## 功能特性

- 杂志风格 Hero 布局：1 张大图头条 + 2 张小图头条，全屏图片叠加文字
- 新闻卡片展示：缩略图、彩色分类边条、摘要截断（line-clamp-2）、来源与日期
- 多维度筛选：Today / This Week 切换，Category / Company / Topic 下拉过滤
- 实时搜索：输入即搜，自动隐藏 Hero 聚焦结果
- EN / CN 一键切换：UI 文案与新闻内容同步翻译
- 入场动画：Hero 左右滑入 + 卡片依次上浮
- 回到顶部悬浮按钮
- SEO 优化：Open Graph、Twitter Cards、canonical URL
- Google Analytics 4 接入

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 图标 | Lucide React |
| 数据源 | NewsAPI.org |
| 翻译 | 百度翻译 API（通用文本翻译） |
| 自动化 | GitHub Actions（每天 UTC 14:00） |
| 部署 | Vercel（git push 后自动触发） |
| 分析 | Google Analytics 4 |

---

## 目录结构

```
.
├── .github/
│   └── workflows/
│       └── daily-fetch-news.yml    # 每日自动拉取新闻并翻译
├── src/
│   ├── main.jsx                    # 入口
│   ├── App.jsx                     # 主应用
│   ├── index.css                   # Tailwind + 全局样式
│   ├── i18n.js                     # EN/CN 双语字典
│   ├── components/
│   │   ├── Navbar.jsx              # Logo + 搜索框 + 语言切换
│   │   ├── Hero.jsx                # DAILY BRIEF 头条区（大卡+双小卡）
│   │   ├── TabFilter.jsx           # Today/Week tab + 下拉筛选器
│   │   ├── NewsSection.jsx         # 新闻分区（AI / Musk Companies）
│   │   ├── NewsCard.jsx            # 新闻卡片组件
│   │   ├── TagPill.jsx             # 分类标签胶囊
│   │   ├── LangToggle.jsx          # EN/CN 语言切换按钮
│   │   ├── BackToTop.jsx           # 回到顶部按钮
│   │   └── Drawer.jsx              # 已废弃（保留文件但不再使用）
│   ├── context/
│   │   └── LangContext.jsx          # React Context 管理语言状态
│   ├── data/                       # 每日新闻 JSON（脚本自动生成）
│   │   ├── news-2026-06-13.json
│   │   └── ...
│   └── utils/
│       ├── loadNews.js             # 动态读取 news-*.json，按日期过滤
│       └── constants.js            # 公司列表、主题列表、颜色常量
├── scripts/
│   └── fetch-news.mjs              # 核心：调 NewsAPI → 过滤 → 百度翻译 → 写 JSON
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .env.example                     # 环境变量模板
```

---

## 快速开始

### 前置条件

Node.js >= 18。

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

浏览器访问终端打印的地址（通常是 http://localhost:5173）。

### 生产构建

```bash
npm run build    # 产物在 dist/
npm run preview  # 本地预览 dist/
```

---

## 环境变量配置

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

`.env.local` 配置项说明：

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEWS_API_KEY` | 是 | NewsAPI.org 的 API key，注册地址 https://newsapi.org |
| `HTTPS_PROXY` | 否 | 代理地址，如 `http://127.0.0.1:7890`。需要先安装 `https-proxy-agent` |
| `BAIDU_APP_ID` | 否 | 百度翻译 API 的 APP ID，用于自动翻译标题和摘要为中文 |
| `BAIDU_SECRET_KEY` | 否 | 百度翻译 API 的密钥 |

### 手动拉取新闻

```bash
npm run fetch-news
```

该命令会调用 NewsAPI 拉取当天新闻，经过 4 层过滤后写入 `src/data/news-YYYY-MM-DD.json`。如果配置了百度翻译，会同时生成中文标题和摘要。

---

## 数据字段说明

每条新闻 item 的字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 唯一标识，格式 `newsapi-{timestamp}-{idx}` |
| `title` | string | 英文标题 |
| `summary` | string | 英文摘要 |
| `url` | string | 原文链接 |
| `source` | string | 媒体来源名称 |
| `publishedAt` | string | ISO 时间，如 `2026-06-13T04:20:00Z` |
| `imageUrl` | string/null | 封面图片 URL |
| `category` | string | 分类：`ai` 或 `musk` |
| `company` | string/null | 当 category 为 musk 时填写：Tesla / SpaceX / X / Neuralink / The Boring Company / xAI / Starlink / Other |
| `topic` | string | 主题标签：LLMs / Multimodal / Agents / Robotics / Autonomous / Chips / Policy / Funding & M&A / Product Launch / Research / Other |
| `topNews` | boolean | 是否显示在 Hero 头条区 |
| `titleZh` | string/null | 百度翻译的中文标题 |
| `summaryZh` | string/null | 百度翻译的中文摘要 |

---

## 部署方式

项目采用 **GitHub Actions + Vercel** 全自动部署流程：

1. **GitHub Actions**（`.github/workflows/daily-fetch-news.yml`）：每天 UTC 14:00 自动运行 `fetch-news.mjs`，拉取新闻并翻译后 commit 到仓库。
2. **Vercel**：检测到 git push 后自动重新构建和部署，无需人工干预。

### GitHub Secrets 配置

在 GitHub 仓库 Settings > Secrets and variables > Actions 中添加以下 secrets：

| Secret 名称 | 说明 |
|-------------|------|
| `NEWS_API_KEY` | NewsAPI.org 的 API Key |
| `BAIDU_APP_ID` | 百度翻译 APP ID |
| `BAIDU_SECRET_KEY` | 百度翻译密钥 |

> `GITHUB_TOKEN` 由 GitHub Actions 自动提供，无需手动配置。

### 颜色系统

| 用途 | 颜色值 | 名称 |
|------|--------|------|
| 背景色 | `#0B1220` | 深空蓝 |
| 强调色 | `#00E5FF` | 电光青 |
| Musk 区强调色 | `#E11D48` | 马斯克红 |

---

## FAQ

**Q: 首页一片空白？**
A: `src/data/` 目录下没有匹配 `news-*.json` 的文件。运行一次 `npm run fetch-news` 即可。

**Q: NewsAPI 免费额度不够用怎么办？**
A: 免费版 100 次/天已够每天抓取一次。可升级 Pro（$10/月），或更换数据源。

**Q: 百度翻译报频率限制错误？**
A: 脚本内置了指数退避重试机制（最多 3 次），并在每条请求间间隔 1.5 秒。如仍频繁报错，检查免费额度是否用完或考虑升级。

**Q: 如何手动触发 GitHub Actions？**
A: 在仓库的 Actions 页面找到 "Daily Fetch News" 工作流，点击 "Run workflow" 即可手动触发。

**Q: Drawer 组件为什么还在代码里？**
A: 该组件已被废弃不再使用，保留文件仅为历史记录，不影响功能。

**Q: 项目是否支持浅色主题？**
A: 已移除浅色模式，当前仅支持深色主题。
