-- Character Library: user-level, reusable across stories
CREATE TABLE public.character_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  appearance_description TEXT NOT NULL,
  reference_image_url TEXT NOT NULL,
  reference_image_path TEXT NOT NULL,
  portrait_prompt_used TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_character_library_user_id ON public.character_library(user_id);

ALTER TABLE public.character_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
  ON public.character_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters"
  ON public.character_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters"
  ON public.character_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters"
  ON public.character_library FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_character_library_updated_at
  BEFORE UPDATE ON public.character_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Story-Character link: which library characters are used in which story
CREATE TABLE public.story_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.character_library(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, character_id)
);

CREATE INDEX idx_story_characters_story_id ON public.story_characters(story_id);
CREATE INDEX idx_story_characters_character_id ON public.story_characters(character_id);

ALTER TABLE public.story_characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story characters"
  ON public.story_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_characters.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own story characters"
  ON public.story_characters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_characters.story_id
      AND stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own story characters"
  ON public.story_characters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_characters.story_id
      AND stories.user_id = auth.uid()
    )
  );
