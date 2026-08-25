# 一诺未来学堂 · 重构文档索引

本目录是产品级重构的正式设计文档。Phase 2 及之后的所有施工必须以本目录为唯一依据；
与页面里现存实现冲突时，以本目录为准。

## 阅读顺序

| 序号 | 文档 | 内容 |
|---|---|---|
| — | [p0-security-fixes.md](./p0-security-fixes.md) | P0 安全修复的实际改动清单与验证结果 |
| 00 | [phase1/00-product-positioning.md](./phase1/00-product-positioning.md) | 产品定位与工程可执行的产品原则 |
| 01 | [phase1/01-information-architecture.md](./phase1/01-information-architecture.md) | IA 信息架构、路由处置清单、RouteMeta 类型 |
| 02 | [phase1/02-app-shell.md](./phase1/02-app-shell.md) | Child / Parent / Immersive 三种 AppShell |
| 03 | [phase1/03-design-tokens.md](./phase1/03-design-tokens.md) | Design Token 具体值 + Age Adaptive Theme 架构 |
| 04 | [phase1/04-component-api.md](./phase1/04-component-api.md) | 原子组件与语义组件 API |
| 05 | [phase1/05-today-home.md](./phase1/05-today-home.md) | Today 首页线框（桌面 + 手机） |
| 06 | [phase1/06-learning-model.md](./phase1/06-learning-model.md) | LearningNode 统一学习领域模型 |
| 07 | [phase1/07-ability-model.md](./phase1/07-ability-model.md) | 能力成长模型 |
| 08 | [phase1/08-reward-model.md](./phase1/08-reward-model.md) | 奖励与幂等模型 |
| 09 | [phase1/09-ai-tutor.md](./phase1/09-ai-tutor.md) | AI 小诺完整链路与安全层 |
| 10 | [phase1/10-parent-mode.md](./phase1/10-parent-mode.md) | 家长端信息架构与降级展示 |
| 11 | [phase1/11-responsive.md](./phase1/11-responsive.md) | 七档断点响应式规格 |
| 12 | [phase1/12-keep-refactor-delete.md](./phase1/12-keep-refactor-delete.md) | KEEP / REFACTOR / MOVE / DEPRECATE / DELETE 清单 |
| 13 | [phase1/13-risks.md](./phase1/13-risks.md) | 风险清单（Critical / High / Medium / Low） |
| 14 | [phase1/14-phase2-plan.md](./phase1/14-phase2-plan.md) | Phase 2+ 施工计划 |
| 15 | [phase1/15-adr.md](./phase1/15-adr.md) | 架构决策记录（ADR） |

## 五条不可违反的执行原则

1. **不重写已经验证正确的业务。** `src/engine/`、`src/data/chapters.ts`、`src/data/tsumegoLibrary.ts`
   （GoGame / GoAI / gomokuEngine / checkersEngine / sgfParser）没有明确必要不得修改。
2. **内容资产与产品壳分离。** 统一模型通过 Adapter 消费遗留内容，不改写原始课程数据。
3. **先设计，再施工。** 页面不好看不构成立即修改的理由。
4. **不用装饰堆砌高级感。** 层级、一致性、间距、字体、动效、信息架构、内容质量才是高级感来源。
5. **安全优先于功能。** 特别是 AI：用户输入到语音播报之间必须有安全层，不允许直连。
