-- Create storage bucket for processed illustrations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-illustrations',
  'generated-illustrations',
  false,
  52428800,  -- 50MB
  ARRAY['image/png']
);

-- RLS: users can upload to their own folder
CREATE POLICY "Users can upload own illustrations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'generated-illustrations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can read their own illustrations
CREATE POLICY "Users can read own illustrations"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'generated-illustrations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can delete their own illustrations
CREATE POLICY "Users can delete own illustrations"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'generated-illustrations'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Track storage path for cleanup
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS image_storage_path TEXT;
