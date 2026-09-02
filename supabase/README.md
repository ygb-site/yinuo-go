# 云端访问控制（家庭私有）

本学堂只给这一家用。前端不开放注册，只用已经建好的家庭账号登录。

## 关掉公开注册

只藏前端按钮不够，anon key 仍可能调用 `auth.signUp`。

在 [Supabase Dashboard](https://supabase.com/dashboard) → 项目 `kzphjagsliouhmjqjoue` → **Authentication** → **Providers / Settings**：

1. 关闭 **Allow new users to sign up**。
2. 保持邮箱密码登录可用（现有家庭账号要能登录）。
3. 建议关闭公开的 Magic Link / 社交登录，避免旁路建号。

不需要再部署发放账号函数。若云端曾经上过 `admin-create-user`，可在 Dashboard → Edge Functions 里删掉。
