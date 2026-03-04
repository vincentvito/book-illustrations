-- Ambient Library: user-level, reusable across stories
CREATE TABLE public.ambient_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  environment_name TEXT NOT NULL,
  environment_description TEXT NOT NULL,
  reference_image_url TEXT NOT NULL,
  reference_image_path TEXT NOT NULL,
  ambient_prompt_used TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambient_library_user_id ON public.ambient_library(user_id);

ALTER TABLE public.ambient_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ambients"
  ON public.ambient_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ambients"
  ON public.ambient_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ambients"
  ON public.ambient_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ambients"
  ON public.ambient_library FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_ambient_library_updated_at
  BEFORE UPDATE ON public.ambient_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Story-Ambient link: which library ambients are used in which story
CREATE TABLE public.story_ambients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  ambient_id UUID NOT NULL REFERENCES public.ambient_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, ambient_id)
);

CREATE INDEX idx_story_ambients_story_id ON public.story_ambients(story_id);
CREATE INDEX idx_story_ambients_ambient_id ON public.story_ambients(ambient_id);

ALTER TABLE public.story_ambients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story ambients"
  ON public.story_ambients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_ambients.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own story ambients"
  ON public.story_ambients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_ambients.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own story ambients"
  ON public.story_ambients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_ambients.story_id
      AND stories.user_id = auth.uid()
    )
  );
