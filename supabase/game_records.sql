-- ==========================================
-- 智趣棋艺 (Game Records) 棋谱与对局复盘记录表
-- 在 Supabase 控制台的 SQL Editor 中直接粘贴运行即可！
-- ==========================================

CREATE TABLE IF NOT EXISTS public.game_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL, -- 'go' | 'checkers' | 'gomoku'
  mode TEXT NOT NULL,       -- 'ai' | 'twoPlayer' | 'puzzle'
  title TEXT NOT NULL,
  winner TEXT,
  is_user_winner BOOLEAN DEFAULT false,
  total_moves INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  moves_data JSONB DEFAULT '[]'::jsonb,
  win_rate_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 开启行级安全策略 (RLS)
ALTER TABLE public.game_records ENABLE ROW LEVEL SECURITY;

-- 策略：用户可读写自己的棋谱对局，管理员可审计所有对局
DROP POLICY IF EXISTS "Users can view own game records" ON public.game_records;
CREATE POLICY "Users can view own game records"
  ON public.game_records FOR SELECT
  USING (auth.uid() = user_id OR (auth.uid() IS NOT NULL AND public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Users can insert own game records" ON public.game_records;
CREATE POLICY "Users can insert own game records"
  ON public.game_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own game records" ON public.game_records;
CREATE POLICY "Users can update own game records"
  ON public.game_records FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own game records" ON public.game_records;
CREATE POLICY "Users can delete own game records"
  ON public.game_records FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 创建按用户和游戏类型查询的高性能索引
CREATE INDEX IF NOT EXISTS idx_game_records_user_game_type ON public.game_records(user_id, game_type, created_at DESC);

