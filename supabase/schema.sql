-- ==========================================
-- 一诺弈学 (YiNuo Go) Supabase 云数据库完整初始化脚本
-- 在 Supabase 控制台的 SQL Editor 中直接粘贴运行即可！
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

-- 3. 配置行级安全策略 (RLS)
-- 用户读写自己的数据
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT COALESCE(is_admin, false) FROM public.user_profiles WHERE id = auth.uid()) = true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id OR (SELECT COALESCE(is_admin, false) FROM public.user_profiles WHERE id = auth.uid()) = true);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.user_profiles FOR DELETE
  USING ((SELECT COALESCE(is_admin, false) FROM public.user_profiles WHERE id = auth.uid()) = true);

-- 4. 自动维护 updated_at 时间戳函数
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

-- 5. 新注册用户自动初始化个人档案触发器
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, is_admin, profiles_data, settings_data)
  VALUES (
    NEW.id,
    NEW.email,
    -- 默认第一个注册的用户或指定邮箱自动成为管理员，其他用户为普通用户
    (CASE WHEN (SELECT count(*) FROM public.user_profiles) = 0 THEN true ELSE false END),
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

