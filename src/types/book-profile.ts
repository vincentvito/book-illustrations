// ── Genre ──────────────────────────────────────────────────────────────────

export const BOOK_GENRES = [
  { id: 'children-picture-book', label: "Children's Picture Book", description: 'Ages 0-5, bright & simple' },
  { id: 'middle-grade', label: 'Middle Grade', description: 'Ages 9-12, adventurous' },
  { id: 'young-adult', label: 'Young Adult', description: 'Ages 13-17, atmospheric' },
  { id: 'adult-fiction', label: 'Adult Fiction', description: 'Sophisticated & nuanced' },
  { id: 'poetry-literary', label: 'Poetry / Literary', description: 'Abstract & evocative' },
  { id: 'short-story-collection', label: 'Short Story Collection', description: 'Varied moods per story' },
  { id: 'fantasy-scifi', label: 'Fantasy / Sci-Fi', description: 'World-building heavy' },
  { id: 'horror-thriller', label: 'Horror / Thriller', description: 'Tension & atmosphere' },
  { id: 'non-fiction-educational', label: 'Non-Fiction / Educational', description: 'Clear & informative' },
  { id: 'graphic-novel', label: 'Graphic Novel', description: 'Dynamic & panel-ready' },
] as const

export type BookGenre = (typeof BOOK_GENRES)[number]['id']

// ── Age Range ─────────────────────────────────────────────────────────────

export const AGE_RANGES = [
  { id: '0-3', label: '0-3 years', description: 'Board books' },
  { id: '3-5', label: '3-5 years', description: 'Picture books' },
  { id: '6-8', label: '6-8 years', description: 'Early readers' },
  { id: '9-12', label: '9-12 years', description: 'Middle grade' },
  { id: '13-17', label: '13-17 years', description: 'Young adult' },
  { id: '18+', label: '18+ years', description: 'Adult' },
] as const

export type AgeRange = (typeof AGE_RANGES)[number]['id']

// ── Mood / Tone ───────────────────────────────────────────────────────────

export const MOOD_TONES = [
  { id: 'cheerful', label: 'Cheerful / Playful' },
  { id: 'whimsical', label: 'Whimsical / Magical' },
  { id: 'adventurous', label: 'Adventurous / Epic' },
  { id: 'mysterious', label: 'Mysterious / Enigmatic' },
  { id: 'dark', label: 'Dark / Moody' },
  { id: 'romantic', label: 'Romantic / Tender' },
  { id: 'melancholic', label: 'Melancholic / Bittersweet' },
  { id: 'dramatic', label: 'Dramatic / Intense' },
  { id: 'peaceful', label: 'Peaceful / Serene' },
  { id: 'humorous', label: 'Humorous / Quirky' },
] as const

export type MoodTone = (typeof MOOD_TONES)[number]['id']

// ── Character Style ───────────────────────────────────────────────────────

export const CHARACTER_STYLES = [
  { id: 'auto', label: 'Auto', description: 'AI decides based on genre & age' },
  { id: 'realistic', label: 'Realistic', description: 'True-to-life proportions' },
  { id: 'stylized-cartoon', label: 'Stylized / Cartoon', description: 'Exaggerated & expressive' },
  { id: 'anthropomorphic', label: 'Anthropomorphic Animals', description: 'Animals with human traits' },
  { id: 'chibi-cute', label: 'Chibi / Cute', description: 'Super-deformed, adorable' },
  { id: 'abstract-silhouette', label: 'Abstract / Silhouette', description: 'Shapes & shadows' },
  { id: 'classic-storybook', label: 'Classic Storybook', description: 'Traditional illustrated feel' },
] as const

export type CharacterStyle = (typeof CHARACTER_STYLES)[number]['id']

// ── Illustration Type ─────────────────────────────────────────────────────

export const ILLUSTRATION_TYPES = [
  { id: 'full-page', label: 'Full-Page', description: 'Fills the entire page' },
  { id: 'half-page', label: 'Half-Page', description: 'Space for text alongside' },
  { id: 'spot', label: 'Spot Illustration', description: 'Small, no background' },
  { id: 'vignette', label: 'Vignette', description: 'Fades into white at edges' },
  { id: 'double-spread', label: 'Double-Page Spread', description: 'Spans two pages' },
] as const

export type IllustrationType = (typeof ILLUSTRATION_TYPES)[number]['id']

// ── Era / Time Period ─────────────────────────────────────────────────────

export const ERAS = [
  { id: 'auto', label: 'Auto-detect', description: 'Infer from story' },
  { id: 'ancient', label: 'Ancient', description: 'Egyptian, Greek, Roman' },
  { id: 'medieval', label: 'Medieval', description: 'Castles, knights, feudal' },
  { id: 'renaissance', label: 'Renaissance', description: '15th-16th century' },
  { id: 'victorian', label: 'Victorian', description: '19th century' },
  { id: 'early-20th', label: 'Early 20th Century', description: '1900s-1950s' },
  { id: 'modern', label: 'Modern / Contemporary', description: 'Present day' },
  { id: 'futuristic', label: 'Futuristic', description: 'Sci-fi, advanced tech' },
  { id: 'timeless', label: 'Timeless / Fantasy', description: 'No specific era' },
] as const

export type Era = (typeof ERAS)[number]['id']

// ── Cultural / Regional Influence ─────────────────────────────────────────

export const CULTURAL_INFLUENCES = [
  { id: 'none', label: 'None / Universal', description: 'No specific influence' },
  { id: 'european', label: 'European', description: 'Western European traditions' },
  { id: 'east-asian', label: 'East Asian', description: 'Japanese, Chinese, Korean' },
  { id: 'african', label: 'African', description: 'Sub-Saharan & North African' },
  { id: 'latin-american', label: 'Latin American', description: 'Central & South American' },
  { id: 'middle-eastern', label: 'Middle Eastern', description: 'Arabian, Persian, Turkish' },
  { id: 'south-asian', label: 'South Asian', description: 'Indian, Southeast Asian' },
  { id: 'nordic', label: 'Nordic', description: 'Scandinavian, Norse' },
  { id: 'indigenous-folk', label: 'Indigenous / Folk', description: 'Traditional folk art' },
] as const

export type CulturalInfluence = (typeof CULTURAL_INFLUENCES)[number]['id']

// ── Detail Level ──────────────────────────────────────────────────────────

export const DETAIL_LEVELS = [
  { id: 'simple', label: 'Simple / Minimal', description: 'Clean, few elements' },
  { id: 'moderate', label: 'Moderate', description: 'Balanced detail' },
  { id: 'rich', label: 'Richly Detailed', description: 'Complex, layered' },
] as const

export type DetailLevel = (typeof DETAIL_LEVELS)[number]['id']

// ── Lighting Mood ─────────────────────────────────────────────────────────

export const LIGHTING_MOODS = [
  { id: 'natural', label: 'Natural Daylight', description: 'Bright, even light' },
  { id: 'golden', label: 'Golden Hour / Warm', description: 'Warm sunset tones' },
  { id: 'candlelight', label: 'Candlelight / Firelight', description: 'Flickering warm glow' },
  { id: 'moonlight', label: 'Moonlight / Night', description: 'Cool, silver tones' },
  { id: 'dramatic', label: 'Dramatic Spotlight', description: 'High contrast, focused' },
  { id: 'soft', label: 'Soft / Diffused', description: 'Gentle, no harsh shadows' },
  { id: 'neon', label: 'Neon / Vibrant', description: 'Colorful, electric glow' },
] as const

export type LightingMood = (typeof LIGHTING_MOODS)[number]['id']

// ── Book Profile (composite) ──────────────────────────────────────────────

export interface BookProfile {
  genre: BookGenre
  ageRange: AgeRange
  moods: MoodTone[]
  characterStyle: CharacterStyle
  illustrationType: IllustrationType
  era: Era
  culturalInfluence: CulturalInfluence
  detailLevel: DetailLevel
  lightingMood: LightingMood
  visualMotifs: string
}

// ── Smart Defaults by Genre ───────────────────────────────────────────────

export const GENRE_DEFAULTS: Record<BookGenre, Omit<BookProfile, 'genre' | 'visualMotifs'>> = {
  'children-picture-book': {
    ageRange: '3-5',
    moods: ['cheerful', 'whimsical'],
    characterStyle: 'stylized-cartoon',
    illustrationType: 'full-page',
    era: 'timeless',
    culturalInfluence: 'none',
    detailLevel: 'simple',
    lightingMood: 'natural',
  },
  'middle-grade': {
    ageRange: '9-12',
    moods: ['adventurous'],
    characterStyle: 'stylized-cartoon',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'moderate',
    lightingMood: 'natural',
  },
  'young-adult': {
    ageRange: '13-17',
    moods: ['dramatic', 'mysterious'],
    characterStyle: 'realistic',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'rich',
    lightingMood: 'dramatic',
  },
  'adult-fiction': {
    ageRange: '18+',
    moods: ['dramatic'],
    characterStyle: 'realistic',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'rich',
    lightingMood: 'golden',
  },
  'poetry-literary': {
    ageRange: '18+',
    moods: ['melancholic', 'peaceful'],
    characterStyle: 'abstract-silhouette',
    illustrationType: 'vignette',
    era: 'timeless',
    culturalInfluence: 'none',
    detailLevel: 'moderate',
    lightingMood: 'soft',
  },
  'short-story-collection': {
    ageRange: '18+',
    moods: ['mysterious'],
    characterStyle: 'auto',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'moderate',
    lightingMood: 'golden',
  },
  'fantasy-scifi': {
    ageRange: '13-17',
    moods: ['adventurous', 'mysterious'],
    characterStyle: 'realistic',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'rich',
    lightingMood: 'dramatic',
  },
  'horror-thriller': {
    ageRange: '18+',
    moods: ['dark', 'dramatic'],
    characterStyle: 'realistic',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'rich',
    lightingMood: 'moonlight',
  },
  'non-fiction-educational': {
    ageRange: '9-12',
    moods: ['peaceful'],
    characterStyle: 'realistic',
    illustrationType: 'half-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'moderate',
    lightingMood: 'natural',
  },
  'graphic-novel': {
    ageRange: '13-17',
    moods: ['dramatic', 'adventurous'],
    characterStyle: 'stylized-cartoon',
    illustrationType: 'full-page',
    era: 'auto',
    culturalInfluence: 'none',
    detailLevel: 'rich',
    lightingMood: 'dramatic',
  },
}
