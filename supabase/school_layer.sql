-- ==========================================
-- 学校层：统编教材进度 / 校内作业 / 就寝设置
-- 当前运行时仍写入 user_profiles.profiles_data JSONB（schoolLayer）。
-- 本脚本是结构化表的演进建议，可在需要按课时查询时再执行。
-- ==========================================

CREATE TABLE IF NOT EXISTS public.textbook_catalog (
  id TEXT PRIMARY KEY,
  edition_id TEXT NOT NULL DEFAULT 'pep-2024',
  grade_level TEXT NOT NULL,
  subject_id TEXT NOT NULL CHECK (subject_id IN ('chinese', 'math')),
  unit_number INTEGER NOT NULL,
  unit_title TEXT NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  beijing_points TEXT[] NOT NULL DEFAULT '{}',
  hometown_lesson_id TEXT,
  hometown_title TEXT,
  diff_kind TEXT NOT NULL DEFAULT 'same' CHECK (diff_kind IN ('same', 'pace', 'emphasis', 'extra')),
  diff_note TEXT NOT NULL DEFAULT '',
  estimated_preview_minutes INTEGER NOT NULL DEFAULT 12,
  estimated_review_minutes INTEGER NOT NULL DEFAULT 10,
  catalog_status TEXT NOT NULL DEFAULT 'pending' CHECK (catalog_status IN ('seed', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.child_curriculum_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id TEXT NOT NULL,
  track_role TEXT NOT NULL CHECK (track_role IN ('school', 'hometown')),
  city TEXT NOT NULL CHECK (city IN ('beijing', 'hengshui')),
  edition_id TEXT NOT NULL DEFAULT 'pep-2024',
  grade_level TEXT NOT NULL,
  completed_lesson_ids TEXT[] NOT NULL DEFAULT '{}',
  active_chapter_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (owner_user_id, child_profile_id, track_role)
);

CREATE TABLE IF NOT EXISTS public.child_daily_homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id TEXT NOT NULL,
  work_date DATE NOT NULL,
  item_id TEXT NOT NULL,
  subject_id TEXT NOT NULL CHECK (subject_id IN ('chinese', 'math')),
  parent_note TEXT NOT NULL DEFAULT '',
  linked_lesson_id TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (owner_user_id, child_profile_id, work_date, item_id)
);

CREATE TABLE IF NOT EXISTS public.child_school_task_done (
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id TEXT NOT NULL,
  work_date DATE NOT NULL,
  task_id TEXT NOT NULL,
  done_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (owner_user_id, child_profile_id, work_date, task_id)
);

CREATE TABLE IF NOT EXISTS public.child_sleep_settings (
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id TEXT NOT NULL,
  bedtime_minutes INTEGER NOT NULL DEFAULT 1260,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (owner_user_id, child_profile_id),
  CONSTRAINT bedtime_range CHECK (bedtime_minutes >= 1170 AND bedtime_minutes <= 1320)
);

ALTER TABLE public.textbook_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_curriculum_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_daily_homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_school_task_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_sleep_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog readable by family" ON public.textbook_catalog;
CREATE POLICY "catalog readable by family"
  ON public.textbook_catalog FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "family owns curriculum tracks" ON public.child_curriculum_tracks;
CREATE POLICY "family owns curriculum tracks"
  ON public.child_curriculum_tracks FOR ALL
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "family owns homework" ON public.child_daily_homework;
CREATE POLICY "family owns homework"
  ON public.child_daily_homework FOR ALL
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "family owns task done" ON public.child_school_task_done;
CREATE POLICY "family owns task done"
  ON public.child_school_task_done FOR ALL
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "family owns sleep settings" ON public.child_sleep_settings;
CREATE POLICY "family owns sleep settings"
  ON public.child_sleep_settings FOR ALL
  USING (auth.uid() = owner_user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = owner_user_id OR public.is_admin(auth.uid()));

COMMENT ON TABLE public.textbook_catalog IS '统编课时目录元数据，不含课文全文';
COMMENT ON TABLE public.child_curriculum_tracks IS '北京/衡水两套课时进度，一年级可只记不增压';
COMMENT ON TABLE public.child_daily_homework IS '家长录入的京西校区当日校内作业';
COMMENT ON TABLE public.child_sleep_settings IS '就寝时间；超时后当日学校任务让路';
