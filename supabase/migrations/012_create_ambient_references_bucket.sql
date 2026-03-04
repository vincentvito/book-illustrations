-- Create storage bucket for ambient reference images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ambient-references',
  'ambient-references',
  false,
  52428800,  -- 50MB
  ARRAY['image/png']
);

-- RLS: users can upload to their own folder
CREATE POLICY "Users can upload ambient references"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'ambient-references'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can read their own ambient references
CREATE POLICY "Users can read own ambient references"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ambient-references'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: users can delete their own ambient references
CREATE POLICY "Users can delete own ambient references"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ambient-references'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
