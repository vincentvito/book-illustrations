import type { BookProfile } from '@/types/book-profile'
import {
  BOOK_GENRES,
  AGE_RANGES,
  MOOD_TONES,
  CHARACTER_STYLES,
  ILLUSTRATION_TYPES,
  ERAS,
  CULTURAL_INFLUENCES,
  DETAIL_LEVELS,
} from '@/types/book-profile'

// ── Helpers to turn profile IDs into human-readable labels ────────────────

function label<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string
): string {
  return list.find((item) => item.id === id)?.label ?? id
}

function buildBookContextBlock(profile: BookProfile): string {
  const genre = label(BOOK_GENRES, profile.genre)
  const age = label(AGE_RANGES, profile.ageRange)
  const moods = profile.moods.map((m) => label(MOOD_TONES, m)).join(', ')
  const charStyle = label(CHARACTER_STYLES, profile.characterStyle)
  const illuType = label(ILLUSTRATION_TYPES, profile.illustrationType)
  const era = label(ERAS, profile.era)
  const culture = label(CULTURAL_INFLUENCES, profile.culturalInfluence)
  const detail = label(DETAIL_LEVELS, profile.detailLevel)

  // Character style guidance for Claude's character descriptions
  let charGuidance = ''
  switch (profile.characterStyle) {
    case 'stylized-cartoon':
      charGuidance = 'Describe characters with rounded features, exaggerated expressions, simple clothing. No realistic anatomy details.'
      break
    case 'chibi-cute':
      charGuidance = 'Describe characters with oversized heads, tiny bodies, large sparkling eyes, minimal facial detail.'
      break
    case 'anthropomorphic':
      charGuidance = 'Describe characters as animals with human posture, clothing, and expressions. Specify the animal species.'
      break
    case 'abstract-silhouette':
      charGuidance = 'Describe characters as shapes, silhouettes, or abstract forms. Focus on posture and gesture rather than facial features.'
      break
    case 'realistic':
      charGuidance = 'Describe characters with realistic proportions, detailed facial features, natural clothing and textures.'
      break
    case 'classic-storybook':
      charGuidance = 'Describe characters in a traditional illustrated style — warm, gentle features, slightly idealized proportions.'
      break
  }

  // Age-based content guidelines
  let contentGuidelines = ''
  switch (profile.ageRange) {
    case '0-3':
      contentGuidelines = 'Scenes must be extremely simple and safe. No conflict, danger, or scary imagery. Focus on gentle, comforting, wonder-filled moments with bright settings.'
      break
    case '3-5':
      contentGuidelines = 'Scenes must be age-appropriate and gentle. Avoid frightening, violent, or emotionally distressing imagery. Prefer bright, safe, wonder-filled moments.'
      break
    case '6-8':
      contentGuidelines = 'Scenes can include mild adventure and gentle tension, but avoid graphic violence, horror, or deeply distressing content. Keep imagery uplifting overall.'
      break
    case '9-12':
      contentGuidelines = 'Scenes can include adventure, moderate tension, and emotional complexity. Avoid graphic violence or horror.'
      break
    case '13-17':
      contentGuidelines = 'Scenes can handle dramatic tension, emotional depth, and complex themes. Avoid gratuitous violence or explicit content.'
      break
    case '18+':
      contentGuidelines = 'Full artistic range. Scenes can include mature themes, dramatic intensity, and complex emotional content as appropriate to the story.'
      break
  }

  const lines = [
    'BOOK CONTEXT:',
    `- Genre: ${genre}`,
    `- Target audience: ${age}`,
    `- Tone: ${moods}`,
    `- Detail level: ${detail}`,
  ]

  if (profile.characterStyle !== 'auto') {
    lines.push(`- Character style: ${charStyle}. ${charGuidance}`)
  }

  lines.push(`- Illustration type: ${illuType}`)

  if (profile.era !== 'auto') {
    lines.push(`- Era / time period: ${era}`)
  }

  if (profile.culturalInfluence !== 'none') {
    lines.push(`- Cultural influence: ${culture} — reflect this in architecture, clothing, patterns, and environment details`)
  }

  lines.push(`- Content guidelines: ${contentGuidelines}`)

  return lines.join('\n')
}

// ── Character extraction prompt ───────────────────────────────────────────

export function buildCharacterExtractionPrompt(
  storyText: string,
  profile?: BookProfile
): string {
  const profileBlock = profile ? `\n${buildBookContextBlock(profile)}\n` : ''

  return `You are an expert book illustrator advisor. Analyze the following story and identify ALL characters that would need a visual representation in illustrations.
${profileBlock}
STORY TEXT:
---
${storyText}
---

Identify every character who appears in the story. For each character, provide a detailed physical appearance description that an illustrator would need to draw them consistently across multiple images.

Include:
- Main characters (always include)
- Supporting characters who appear in multiple scenes
- Any character with a notable physical description in the text

For each character's appearance, describe: approximate age, body build, hair color/style, eye color, skin tone, facial features, typical clothing, and any distinguishing features (scars, glasses, accessories, etc.). If the text doesn't specify a detail, infer something plausible and consistent with the story's setting and genre.

Respond ONLY with valid JSON in this exact format:
{
  "characters": [
    {
      "name": "Character name",
      "appearance": "Detailed physical description: age, build, hair, face, clothing, distinguishing features"
    }
  ]
}`
}

// ── Main export ───────────────────────────────────────────────────────────

export function buildAnalysisPrompt(
  storyText: string,
  mode: 'cover' | 'single' | 'all',
  profile?: BookProfile,
  approvedCharacters?: Array<{ name: string; appearance: string }>
): string {
  const profileBlock = profile ? `\n${buildBookContextBlock(profile)}\n` : ''

  const hasCharacters = approvedCharacters && approvedCharacters.length > 0
  const charactersBlock = hasCharacters
    ? `\nKNOWN CHARACTERS (already identified and approved by the user — use these exact names when referencing characters):\n${approvedCharacters.map(c => `- ${c.name}: ${c.appearance}`).join('\n')}\n`
    : ''

  const baseInstruction = `You are an expert book illustrator advisor. Analyze the following story and suggest illustration subjects.
${profileBlock}${charactersBlock}
STORY TEXT:
---
${storyText}
---
`

  switch (mode) {
    case 'cover':
      return `${baseInstruction}
Suggest exactly 4 different cover illustration subjects for this book.
Each subject must:
- Capture the essence/theme of the entire story
- Be visually striking and suitable as a book cover
- Describe a COMPOSITION that leaves the upper 25-30% relatively empty or with sky/soft background for title text placement
- Include the main character(s) or central visual motif
- Be described in 2-3 detailed sentences suitable as an image generation prompt
- Respect the book context above (audience, tone, character style, content guidelines)
${hasCharacters ? '- Include a "characters" field listing which of the known characters appear in each subject\n' : ''}
Respond ONLY with valid JSON in this exact format:
{
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "Detailed visual description for image generation...",
      "storyContext": "Brief explanation of why this captures the story"${hasCharacters ? ',\n      "characters": ["Character name 1"]' : ''}
    }
  ]
}`

    case 'single':
      return `${baseInstruction}
Suggest exactly 4 different illustration subjects from this story.
Each subject must:
- Depict a key moment, scene, or emotional beat from the story
- Be visually interesting and narratively significant
- Be described in 2-3 detailed sentences suitable as an image generation prompt
- Include details about characters, setting, mood, and action
- Respect the book context above (audience, tone, character style, content guidelines)
${hasCharacters ? '- Include a "characters" field listing which of the known characters appear in each subject\n' : ''}
Respond ONLY with valid JSON in this exact format:
{
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "Detailed visual description for image generation...",
      "storyContext": "Which part of the story this illustrates and why"${hasCharacters ? ',\n      "characters": ["Character name 1"]' : ''}
    }
  ]
}`

    case 'all':
      return `${baseInstruction}
Divide this story into its major narrative sections and select one illustration subject for each.

GUIDELINES FOR SCENE SELECTION:
- Include between 3 and 12 illustrations depending on story length
- Always include a scene near the opening and near the ending
- Prioritize turning points, climactic moments, and emotionally charged scenes
- Skip purely expository or transitional passages that lack visual interest
- Avoid scenes that are primarily dialogue with no physical action or setting change
- Avoid abstract/internal moments (thoughts, feelings) that don't manifest visually
- Each scene must be understandable as a standalone image without reading the text
- No two illustrations should depict a visually similar composition or setting
- Respect the book context above — select scenes that match the specified tone and are appropriate for the target audience

GUIDELINES FOR DESCRIPTIONS:
- Write 4-6 detailed sentences optimized as an image generation prompt
- Focus on the SCENE, ENVIRONMENT, and CHARACTER ACTIONS — do NOT repeat the character's physical appearance in the description (that will be handled by reference images)
- Instead, describe: character pose/expression/action, environment/setting details, lighting/atmosphere, spatial depth (foreground/midground/background)
- Do NOT mention art style, color palette, or medium — these are controlled separately
- Focus on concrete visual details, not narrative interpretation

VISUAL VARIETY — the set of illustrations MUST include a mix of:
- Scene scales: at least one wide establishing shot AND one close-up or detail shot
- Emotional range: vary between tension, joy, wonder, sadness, calm across the set
- Composition: alternate between action scenes, quiet moments, and environmental scenes

${hasCharacters
  ? `Use the known characters listed above when assigning characters to scenes. Reference them by their exact name.
Identify the distinct environments/settings that appear across the story.`
  : `First, identify the recurring characters and define their visual appearance.
Then, identify the distinct environments/settings that appear across the story.`} Each environment should be a visually unique location (e.g. "The Enchanted Forest", "Clara's Kitchen", "The Castle Courtyard"). Write a detailed visual description of each environment covering architecture, landscape, lighting, weather, textures, atmosphere, and distinctive features.
Then select scenes, assigning each scene to one of the identified environments.

Respond ONLY with valid JSON in this exact format:
{
${hasCharacters ? '' : `  "characters": [
    {
      "name": "Character name",
      "appearance": "Consistent physical description: age, build, hair, face, clothing, distinguishing features"
    }
  ],
`}  "environments": [
    {
      "name": "Environment name (e.g. The Enchanted Forest)",
      "description": "Detailed visual description: architecture, landscape, lighting, weather, color palette, textures, atmosphere, time of day, distinctive features. 3-5 sentences."
    }
  ],
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "4-6 sentence visual description for image generation. Focus on scene, actions, environment, lighting, and spatial composition. Do NOT describe character appearance (that comes from reference images). No style or color references.",
      "characters": ["Character name 1", "Character name 2"],
      "environment": "Environment name from the environments list above",
      "storyContext": "Why this moment was chosen and what it represents in the narrative arc",
      "storySection": "First few words of the sentence in the story where this scene occurs"
    }
  ]
}`
  }
}
