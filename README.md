# 一诺弈学 (YiNuo Go) 🐼 · 少儿多学科启蒙与围棋智慧学堂

<div align="center">

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20RLS-3ECF8E?logo=supabase&logoColor=white)
![DeepSeek](https://img.shields.io/badge/AI%20Tutor-DeepSeek%20Flash-4D6BFE?logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-amber)

**专为 4~10 岁儿童设计的全场景互动启蒙学习应用。融合围棋棋力进阶、数学数感速算、语文汉字拼音与英语自然拼读，搭载小诺 AI 启发式伴学导师。**

[在线体验](https://yinuogo.cn) · [安全策略](./SECURITY.md) · [贡献指南](./CONTRIBUTING.md)

</div>

---

## 🌟 核心功能模块

### 1. ♟️ 围棋启蒙世界 (Go Mastery Academy)
* **6 大篇章 28 关互动主线**：从棋盘气数、吃子魔法、真眼假眼、经典手筋到地盘划定与终局数子，配趣味剧情与名师点睛。
* **46 道死活手筋题库**：吃子、做眼、破眼、倒扑、接不归、双活等阶梯死活拆解。
* **多元互动玩法**：
  * 🦁 **吃子大冒险** & **趣味街机小游戏**（极速吃子、数气抢答、连与断挑战）。
  * 👑 **段位升级考**：6 级渐进式定段晋级考核与荣誉证书生成。
  * 👥 **亲子面对面对弈**：支持连续停一手自动数子判输赢、主动点目与认输结算。
  * 🎨 **装扮商城**：用金币兑换卡通头像，给宝贝换上专属形象。
  * 📖 **围棋小词典 & 口诀卡**：中英双语围棋术语库与语音点读。

---

### 2. 🔢 数学数感探究 (Math Academy)
* **口算速算专项训练**：涵盖 10/20/100 以内进位加法、退位减法（破十法）、乘法口诀。
* **竖式计算可视化**：进退位动态标记与借位演算提示。
* **24 点益智解密**：锻炼数字敏感度与四则运算逻辑。
* **30 题全真模拟考**：计时交卷、自动批改与详细步骤复盘。

---

### 3. 🏮 语文经典素养 (Chinese Academy)
* **田字格标准笔顺描红**：集成 HanziWriter 汉字笔画动画演示与逐笔描红书写评测。
* **标准拼音拼读字典**：声母、韵母、整体认读音节标准发音与四声调发音规律。
* **少儿趣味字谜大闯关**：经典字谜趣味推理与拼音汉字启蒙。
* **趣味字谜与成语典故**：猜字谜赢金币，寓教于乐积累汉字文化。

---

### 4. 🔤 英语自然拼读 (English Academy)
* **Phonics 自然拼读发音**：26 个字母与常见字母组合发音规律。
* **双语图文单词闪卡**：生活核心高频词汇卡片与原声例句点读。
* **语音发音智能评测**：利用 Web Speech 识别儿童发音并进行相似度打分（星级评定与反馈）。

---

### 5. 🐼 小诺 AI 伴学导师 (Interactive AI Tutor)
* **3 步梯度思维点拨**：
  * `💡 第 1 步：找思路`（运算法则与棋形概念提示）
  * `🔍 第 2 步：看关键`（关键步骤拆解与易错点剖析）
  * `🎯 第 3 步：看详解`（完整正解图解与举一反三）
* **智能变式巩固题**：针对错题自动派生同类变式题，攻克思维漏洞。
* **多轮连续对话与语音伴读**：
  * 支持 DeepSeek（默认 `deepseek-v4-flash`）与 OpenAI 兼容接口，自带 6 轮问答记忆与追问。
  * 支持 100% 离线本地启发规则引擎（零配置开箱即用）。
* **少儿安全护栏**：严格防提示词注入，坚决不收集/不输出任何真实儿童隐私。

---

### 6. 📊 成长中心与家长学情看板
* **多学科自动错题本**：错题自动入库归类，支持专项随机消灭与双倍金币奖励。
* **四大学科能力雷达图**：围棋棋力、数学数感、语文素养、英语拼读 4 维能力雷达图分析。
* **每日打卡与金币星星流水**：连续 7 天打卡大奖，学情流水明细记录。
* **AI 家长日报**：生成每日学习时长、薄弱知识点分析与个性化复习建议。

---

## 🔒 安全与数据隐私设计

本项目遵循 **“代码公开，孩子数据绝不公开”** 原则：

1. **儿童数据最小化 (Data Minimization)**：仅保存虚拟昵称、卡通头像与学习关卡数据，严禁收集真实儿童姓名、照片、身份证或住址。
2. **云数据库权限安全 (Supabase RLS)**：全表启用 PostgreSQL Row Level Security，部署 `public.is_admin()` 安全函数与 `BEFORE UPDATE` 防提权触发器，彻底隔离跨家庭数据。
3. **安全脱敏数据备份**：本地 JSON 导出彻底剥离家长账户 UID、邮箱与 Secret；导入具备 2MB 限制、Schema 结构白名单与 Prototype Pollution 原型污染防御。
4. **前端安全无密钥泄露**：浏览器端仅配置匿名 Public Key，大模型 API Key 仅保留在用户当前浏览器持久存储中，支持绑定家长账号多端同步。

详细安全准则请查阅 [SECURITY.md](./SECURITY.md)。

---

## 🛠️ 技术栈一览

| 领域 | 技术方案 |
| :--- | :--- |
| **前端核心** | Vue 3 (Composition API, `<script setup>`) + TypeScript |
| **构建工具** | Vite 6 + PostCSS + Autoprefixer |
| **样式方案** | Tailwind CSS 3.4 + 手绘卡通字体 (ZCOOL KuaiLe / Fredoka) |
| **状态管理** | Pinia 4 + pinia-plugin-persistedstate |
| **路由导航** | Vue Router 5 (HTML5 History 模式 + 渐进式解锁路由守卫) |
| **云端存储 & 认证** | Supabase (PostgreSQL + RLS + Auth + Edge Functions) |
| **数学公式渲染** | KaTeX 0.18 (带 XSS 安全转义防护) |
| **汉字与拼音引擎** | HanziWriter 3.7 + pinyin-pro 3.29 |
| **音频与语音** | Howler.js 2.2 + Web Speech API (Synthesis & Recognition) |
| **测试框架** | Vitest 4 (47 项单元与安全测试全部自动化校验) |

---

## 🚀 本地开发与构建指南

### 1. 克隆项目并安装依赖
```bash
git clone https://github.com/ygb-site/yinuo-go.git
cd yinuo-go
npm install
```

### 2. 启动本地开发服务
```bash
npm run dev
```
* 浏览器访问 `http://localhost:5173`，自适应 PC 宽屏、平板与手机端触摸屏。

### 3. 运行完整单元与安全测试套件
```bash
npm test
```

### 4. 生产环境构建与类型检查
```bash
npm run build
```
* 构建产物将自动优化并输出至 `dist/` 目录。

### 5. 本地预览生产构建产物
```bash
npm run preview
```

---

## 📁 核心项目结构

```text
yinuo-go/
├── .github/              # GitHub Actions CI & Dependabot 安全监控
├── public/               # PWA 清单、图标与 Service Worker
├── src/
│   ├── components/       # 业务与通用组件 (GoBoard 矢量棋盘、汉字描红、公式渲染等)
│   │   ├── common/       # 伴学助教浮窗、每日任务、认证证书、多学员切换弹窗
│   │   ├── board/        # 独立围棋棋盘与落子控制器
│   │   └── questions/    # 多学科通用题目渲染组件
│   ├── data/             # 课程大纲、知识点图谱、拼音字典、字谜题库、成语典故
│   ├── engine/           # 围棋数气状态机、5级 AI 算法、SGF 棋谱解析器
│   ├── lib/              # 音频音效库、Supabase 客户端
│   ├── router/           # Vue Router 路由守卫与渐进式功能解锁配置
│   ├── services/         # AI 助教服务、数据安全备份、云同步、发音评测
│   ├── stores/           # Pinia 状态机 (用户档案、关卡解锁、死活题、AI 助教)
│   ├── types/            # 全学科课程与错题数据类型定义
│   ├── utils/            # 语音朗读、语音识别、音效、PWA 工具
│   └── views/            # 18+ 个全学科与围棋主线视图页面
│       ├── math/         # 数学口算速算、24点
│       ├── chinese/      # 汉字笔顺、拼音、字谜、成语
│       └── english/      # 自然拼读、单词闪卡
├── supabase/
│   └── schema.sql        # Supabase PostgreSQL RLS 与防提权安全脚本
├── tests/                # Vitest 自动化单元测试与安全审计测试集
├── SECURITY.md           # 安全策略与儿童隐私合规说明
├── CONTRIBUTING.md       # 开源贡献指南
├── vite.config.ts        # Vite 配置 (含 TTS & AI 代理中间件)
└── package.json
```

---

## 📄 开源许可证

本项目基于 [MIT License](./LICENSE) 协议开源。

