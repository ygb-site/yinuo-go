# 一诺弈学 (YiNuo Go) 🐼 · 少儿互动启蒙围棋世界

> 基于 **Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia + Vue Router** 构建的少儿围棋启蒙教学 Web 应用（自适应电脑官网与移动端 Web）。

---

## 🌟 核心特色

- 🎯 **自适应响应式**：原生支持 PC 官网宽屏与手机移动端触摸屏。
- 🐼 **核心围棋算法**：
  - 气数、禁着点、提子、眼位计算与状态机 (`src/engine/GoGame.ts`)
  - 5 级萌宠 AI 决策系统 (`src/engine/GoAI.ts`)
  - 完整 6 大篇章 24 关启蒙教学关卡库与 46 道经典死活宝库 (`src/data/`)
- 🎨 **SVG 矢量质感棋盘**：指尖触摸丝滑、落子音效、提子动画、叫吃警示、死活拆解。
- 💾 **本地数据持久化**：支持离线做题、金币收集、成就解锁、多学员档案切换。

---

## 🚀 本地开发与构建

### 1. 启动本地开发服务（官网 & 移动端）
```bash
npm run dev
```
* 浏览器访问 `http://localhost:5173`，自适应 PC 桌面与手机移动端。

### 2. 构建正式发布包
```bash
npm run build
```
* 构建产物输出至 `dist/` 目录。

### 3. 本地预览构建产物
```bash
npm run preview
```

---

## 📁 目录结构

```text
yinuo-go/
├── src/
│   ├── components/      # 通用组件 (GoBoard.vue 矢量棋盘、Navbar、各类弹窗)
│   ├── data/            # 教程关卡、死活题库、成就词典数据
│   ├── engine/          # 围棋规则状态机、AI 算法、SGF 解析
│   ├── router/          # Vue Router 路由配置 (18 个功能视图)
│   ├── stores/          # Pinia 状态管理与数据持久化
│   ├── utils/           # 音效、语音合成、通知工具
│   ├── views/           # 18 个核心功能页面
│   ├── App.vue          # 根组件
│   └── main.ts          # 应用入口
├── public/              # 静态公共资源
├── vite.config.ts       # Vite 构建配置
└── package.json
```

