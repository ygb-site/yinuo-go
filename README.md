# 一诺弈学 (YiNuo Go) 🐼 · 少儿互动启蒙围棋世界

> 基于 **Vue 3 + Uni-app + TypeScript + Pinia** 构建的少儿围棋启蒙教学全平台应用。
> **一套代码，同时原生支持 微信小程序、手机 H5 浏览器、电脑官网。**

---

## 🌟 核心优势

- 🎯 **一套代码，全端通用**：统一管理，修改任何逻辑或题库，微信小程序和官网同时生效。
- 🐼 **核心围棋算法 100% 共享**：
  - 气数、禁着点、提子、眼位计算与状态机 (`src/engine/GoGame.ts`)
  - 5 级萌宠 AI 决策系统 (`src/engine/GoAI.ts`)
  - 完整启蒙教学关卡库与死活宝库 (`src/data/`)
- 🎨 **SVG 高性能矢量棋盘**：全平台原生支持，指尖触摸丝滑、动画流畅。
- 💾 **跨端离线存档**：小程序与网页版均支持离线做题、自动存档。

---

## 🚀 快速上手与运行

### 1. 启动微信小程序端（实时热更新开发）
```bash
npm run dev:mp-weixin
```
* 打开 **微信开发者工具** ➡️ 点击 **导入项目**。
* 选择目录：`dist/dev/mp-weixin`（开发版）或 `dist/build/mp-weixin`（正式发布版）。
* AppID 选择「测试号」或填入您的小程序 AppID，即可在模拟器及真机扫码调试！

### 2. 启动官网 / 手机 H5 端（浏览器开发）
```bash
npm run dev:h5
# 或简写
npm run dev
```
* 浏览器访问 `http://localhost:5173`，自适应 PC 宽屏与手机触屏。

### 3. 一键构建正式发布包
```bash
# 1. 构建微信小程序发布包 (产物输出至 dist/build/mp-weixin)
npm run build:mp-weixin

# 2. 构建官网/H5发布包 (产物输出至 dist/build/h5)
npm run build:h5
```

---

## 📁 目录结构

```text
yinuo-go/
├── src/
│   ├── components/      # 跨端通用组件 (GoBoard.vue 唯一 SVG 棋盘组件)
│   ├── data/            # 关卡教程、死活题库、成就词典数据
│   ├── engine/          # 围棋规则状态机、AI 算法、SGF 解析
│   ├── pages/           # 各页面 (首页、启蒙学堂、关卡互动、死活宝库、街机对弈、个人中心)
│   ├── stores/          # Pinia 状态管理与跨端数据持久化
│   ├── utils/           # 跨端音效与存储适配
│   ├── App.vue          # 小程序生命周期与全局样式
│   ├── main.ts          # 应用入口
│   ├── manifest.json    # 小程序 AppID、H5 路由、平台配置
│   └── pages.json       # 页面路由与底部 TabBar 配置
├── vite.config.ts       # Uni-app + Vite 构建配置
└── package.json
```

