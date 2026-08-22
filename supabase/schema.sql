-- ==========================================
-- 一诺弈学 (YiNuo Go) Supabase 云数据库安全加固初始化脚本
-- 在 Supabase 控制台的 SQL Editor 中直接粘贴运行即可！
-- 安全特性：
-- 1. 严格开启 Row Level Security (RLS)
-- 2. 避免 RLS 内部递归循环，使用 SECURITY DEFINER 函数 public.is_admin()
-- 3. 严格禁止普通用户越权修改 is_admin 字段 (通过 BEFORE UPDATE 触发器防御提权)
-- 4. 普通用户仅能读写自身及所属家庭数据，管理员拥有全局管理审计能力
-- ==========================================

-- 1. 创建用户进度与档案同步表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  active_profile_id TEXT,
  profiles_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings_data JSONB NOT NULL DEFAULT '{"theme": "wood", "soundEnabled": true, "volume": 0.8}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 如果表已存在但没有 is_admin 列，则安全添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. 启用行级安全策略 (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. 管理员权限判定安全函数 (SECURITY DEFINER, 避免 RLS 内部无限递归查询)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT is_admin INTO admin_status FROM public.user_profiles WHERE id = user_id;
  RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. 关键安全防御触发器：严格阻止非管理员将自身或其他用户提权为 is_admin = true
CREATE OR REPLACE FUNCTION public.protect_user_profile_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- 如果尝试修改 is_admin 字段
  IF (OLD.is_admin IS DISTINCT FROM NEW.is_admin) THEN
    -- 只有已经是管理员的用户，或者 postgres/service_role 才能修改 is_admin
    IF NOT public.is_admin(auth.uid()) AND current_user NOT IN ('postgres', 'service_role') THEN
      RAISE EXCEPTION '安全拦截：普通用户无权更改 is_admin 管理员角色！';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_profile_admin ON public.user_profiles;
CREATE TRIGGER trg_protect_user_profile_admin
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_user_profile_admin_flag();

-- 5. 配置安全行级策略 (RLS Policies)
-- 查询策略：用户可查询自己的数据，管理员可查询全站数据
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.user_profiles;
CREATE POLICY "Users and admins can view profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- 插入策略：新用户只能插入自身 UID 的记录，且非管理员无法初始设为 admin
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND (is_admin = false OR public.is_admin(auth.uid())));

-- 更新策略：用户可更新自己的记录，管理员可更新任意记录 (is_admin 修改被触发器二次校验)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON public.user_profiles;
CREATE POLICY "Users and admins can update profiles"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- 删除策略：用户可注销删除自己的档案，管理员可删除违规账号
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users delete own or admin deletes" ON public.user_profiles;
CREATE POLICY "Users delete own or admin deletes"
  ON public.user_profiles FOR DELETE
  USING (auth.uid() = id OR public.is_admin(auth.uid()));

-- 6. 自动维护 updated_at 时间戳函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. 新注册用户自动初始化个人档案触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_admin, profiles_data, settings_data)
  VALUES (
    NEW.id,
    NEW.email,
    false, -- 默认所有注册账号均为普通家庭用户，如需管理员请在 Supabase 控制台手动授权
    '[]'::jsonb,
    '{"theme": "wood", "soundEnabled": true, "volume": 0.8}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

