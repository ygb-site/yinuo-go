# 安全策略与儿童数据隐私规范 (Security & Child Privacy Policy)

一诺弈学（YiNuo Go）是一个开源的少儿多学科与围棋启蒙学习项目。我们高度重视儿童数据隐私与系统安全性。

---

## 1. 核心安全与隐私原则 (Core Principles)

1. **代码公开 ≠ 数据公开**
   - 本项目代码在 GitHub 完全开源，但任何普通用户都绝不能访问其他家庭或儿童的数据与管理能力。
2. **儿童数据最小化 (Data Minimization)**
   - 本项目遵循数据最小化设计：仅使用虚拟昵称、卡通头像 Emoji、年级阶段、学习关卡与星星记录。
   - **严禁**在代码库、测试用例、Mock 数据或 Issue 中包含任何真实儿童的姓名、身份证号、出生日期、学校、住址、手机号或照片。
3. **密钥严格隔离**
   - 浏览器端仅允许使用 Supabase 客户端公开匿名 Key (`anon_key` / `publishable_key`)。
   - **绝对禁止**将 `SUPABASE_SERVICE_ROLE_KEY` 或任何云端管理员 Secret 提交至 Git、配置于前端环境变量或打包进前端产物中。
4. **权限边界明确**
   - **家长乘法锁 (Parental Gate)**：仅作为防止低龄儿童误触进入设置或学情看板的辅助交互屏障，**不作为**身份认证或权限安全边界。
   - **后端与云数据库真实鉴权 (RLS)**：所有用户数据访问与修改必须通过 Supabase PostgreSQL Row Level Security (RLS) 与服务端安全策略进行强制校验。

---

## 2. 漏洞报告渠道 (Reporting a Vulnerability)

如果您在本项目中发现了任何安全漏洞、越权风险、敏感数据泄露或隐私合规问题，**请不要在公开的 GitHub Issue 或 Pull Request 中讨论**。

请通过以下方式私下与项目维护者联系：
- **安全联系邮箱**：`security@yinuogo.cn` 或项目维护者私信
- 我们会在 48 小时内确认并响应，并在确认修复后发布安全补丁与致谢公告。

---

## 3. 安全更新与依赖监控

- 依赖库通过 Dependabot 进行每周自动化安全扫描与漏洞告警。
- 所有 Pull Request 均需通过 GitHub Actions CI 的安全测试、类型检查与构建验证。

