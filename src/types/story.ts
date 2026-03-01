export interface Story {
  id: string
  user_id: string
  title: string
  story_text: string
  filename: string | null
  created_at: string
  updated_at: string
}

export interface StoryListItem {
  id: string
  title: string
  filename: string | null
  updated_at: string
  generation_count: number
  thumbnail_url: string | null
}

export interface StoryWithGenerations extends Story {
  generations: GenerationRecord[]
}

export interface GenerationRecord {
  id: string
  mode: string
  style: string
  palette: string
  book_format: string
  subject: string
  image_url: string | null
  status: string
  created_at: string
}
