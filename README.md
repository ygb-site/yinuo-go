# YiNuo Go (一诺围棋) 🐼 · 少儿互动启蒙围棋世界

> 专为 **4~10 岁少儿** 启蒙定制的高端互动式围棋教学 Web 应用。纯前端零配置起步（Zero-Config Local First），即开即玩，支持一键部署至 GitHub Pages！

---

## ✨ 核心亮点与特色 (Key Highlights)

1. **👦 少儿友好视觉与极致交互（Kid-Friendly UI）：**
   - 暖色原木质感拟物棋盘、糖果粉彩、翡翠温玉与赛博星空等 4 款个性化皮肤自由切换。
   - 拟物化 3D 棋子凸面光泽与立体阴影。
   - 萌宠伴读导师“小诺（NuoNuo）”，生动喜怒哀乐表情互动，全程语音气泡指引。
   - 内置纯前端 Web Audio 真实木质落子音效、提子音效、胜利交响 arpeggio 与全屏粒子礼花（Canvas Confetti）。

2. **🧠 严谨完整的围棋规则引擎（Go Logic Engine）：**
   - 气（Liberties）与连通块（Stone Groups）高精度计算。
   - 提子（Capture）、打吃 / 叫吃（Atari）预警。
   - 禁着点与自杀步（Suicide / Illegal Move）智能拦截。
   - 劫争规则（Ko Rule / 打劫）状态比对防无限循环。
   - 真眼与假眼（Real / False Eye）几何拓扑判定。
   - 中国数子法（Chinese Area Scoring）领地与目数自动判定、贴目（Komi）结算。
   - 多路数棋盘无缝切换：5x5（少儿速战）、7x7、9x9（启蒙标准）、13x13、19x19（标准棋盘）。

3. **🎮 六大核心功能模块 (Core Modules)：**
   - 🗺️ **趣味闯关（Adventure Quest）：** 5 大进阶篇章、24 个循序渐进关卡（从数气、吃子、手筋、死活到圈地盘），满星挑战与金币奖励。
   - 🧩 **每日死活题（Daily Tsumego）：** 涵盖吃子手筋、做活保命、杀棋破眼、对杀技巧、劫争技巧等经典题库，AI 对手动态反击分支。
   - 🤖 **人机对弈场（AI Arena）：** 5 级萌宠 AI（小狗贝贝 25K、小猫喵喵 20K、狐狸阿福 15K、熊猫师傅 10K、一诺大师 5K），配备 AI 推荐点与领地热力图。
   - 🎨 **自由打谱台（Sandbox & SGF）：** 双人本地对弈、自由摆棋编辑、标准 SGF 棋谱导入与导出。
   - 📖 **双语术语小字典（Go Dictionary）：** 24 个专业围棋术语中英双解、童言童语趣解与互动小黑板试玩。
   - 🏆 **成长成就馆（Trophy Room）：** 启蒙初学者到一诺小九段 7 大段位进阶、14 枚闪耀勋章、学习数据持久化与 JSON 备份。

---

## 🛠️ 技术栈 (Tech Stack)

- **框架：** Vue 3 (Composition API) + Vite 8
- **样式与设计：** TailwindCSS 3 + PostCSS + Autoprefixer
- **状态与存储：** Pinia + pinia-plugin-persistedstate (LocalStorage 本地持久化)
- **路由：** Vue Router 4 (Hash 模式，天然兼容 GitHub Pages 与静态托管)
- **图标：** Lucide Vue Next
- **动效与音效：** Canvas-Confetti + Web Audio API 动态音效合成引擎

---

## 🚀 本地开发与运行 (Getting Started)

```bash
# 安装依赖
npm install

# 启动本地开发服务
npm run dev

# 构建生产版本 (类型检查 + 生产打包)
npm run build

# 本地预览生产产物
npm run preview
```

