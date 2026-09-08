# 贡献指南 (Contributing to YiNuo Go)

感谢您对一诺弈学（YiNuo Go）少儿启蒙学习开源项目的关注与支持！

在提交 Issue 或 Pull Request 之前，请阅读以下规范。

---

## 1. 行为准则与隐私底线

- **儿童数据保护**：请勿在 PR、Commit 历史或讨论区提交任何真实儿童的姓名、学校、联系方式或真实学习档案。
- **虚拟化测试数据**：所有单元测试与示例数据必须使用虚构昵称（如“小诺”、“乐乐”、“聪明宝贝”）与虚拟数据。
- **密钥安全**：提交代码前请自查，确保没有将个人的 API Key、OAuth Secret 或 Service Role Key 提交至 Git 暂存区。

---

## 2. 开发与验证流程

1. **安装依赖**
   ```bash
   npm install
   ```

2. **本地开发**
   ```bash
   npm run dev
   ```

3. **运行完整测试套件**
   ```bash
   npm test
   ```

4. **类型检查与构建**
   ```bash
   npm run build
   ```

---

## 3. Pull Request 提交自查清单

- [ ] 所有的单元测试与安全测试全部通过 (`npm test`)
- [ ] TypeScript 类型检查与 Vite 生产构建无报错 (`npm run build`)
- [ ] 未引入任何明文 Secret 或管理员凭据
- [ ] 严格遵守 UI 弹窗规范：**绝对未引入原生 alert() / confirm() / prompt()**，全部使用 `showAlert` / `showConfirm`
- [ ] 所有数据导出/导入功能均通过了 Schema 验证与防原型污染检查
- [ ] 所有公式或动态渲染组件均进行了安全转义 (防 XSS)


---

## 4. UI 交互与弹窗设计规范（强制红线）

为保障少儿启蒙学习产品的沉浸体验、视觉一致性与护眼审美，本项目**严禁使用任何浏览器原生系统弹窗**：

- **绝对禁止原生弹窗**：严禁在代码中直接或间接调用 `alert()`, `window.alert()`, `confirm()`, `window.confirm()`, `prompt()`。原生系统弹窗风格粗糙、具有侵入性，会直接破坏少儿用户体验与亲子交互流程。
- **强制使用全局统一弹窗系统**：
  - **提示反馈 / 校验报错**：统一使用 `import { showAlert } from '@/utils/alert'`，支持 `warning`、`success`、`info`、`error`、`coin` 等萌趣主题及对应柔和少儿音效。
  - **二次确认 / 危险操作警告**：统一使用 `import { showConfirm } from '@/utils/alert'`，基于 Promise 处理用户的确认与取消操作。
  - **复杂表单与定制模态框**：统一使用设计系统中的 `<AppModal>` 组件。
- **自动化红线审查**：本项目已在 `tests/uiDialogAudit.spec.ts` 中配置静态代码扫描，任何新增的原生 `alert()` / `confirm()` 调用都会导致 CI 与本地测试失败拦截。

