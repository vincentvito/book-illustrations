-- Add book_profile JSONB column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS book_profile jsonb DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN stories.book_profile IS 'Stores book profile settings (genre, age range, mood, character style, etc.) as JSON';
