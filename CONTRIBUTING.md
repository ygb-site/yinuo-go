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
- [ ] 所有数据导出/导入功能均通过了 Schema 验证与防原型污染检查
- [ ] 所有公式或动态渲染组件均进行了安全转义 (防 XSS)

