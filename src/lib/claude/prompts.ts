export function buildAnalysisPrompt(
  storyText: string,
  mode: 'cover' | 'single' | 'all'
): string {
  const baseInstruction = `You are an expert book illustrator advisor. Analyze the following story and suggest illustration subjects.

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

Respond ONLY with valid JSON in this exact format:
{
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "Detailed visual description for image generation...",
      "storyContext": "Brief explanation of why this captures the story"
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

Respond ONLY with valid JSON in this exact format:
{
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "Detailed visual description for image generation...",
      "storyContext": "Which part of the story this illustrates and why"
    }
  ]
}`

    case 'all':
      return `${baseInstruction}
Divide this story into its major narrative sections/chapters and suggest one illustration subject for each section.
Suggest between 3 and 12 illustrations depending on story length.
Each subject must:
- Correspond to a specific section of the story (provide approximate location)
- Depict the most visually compelling moment from that section
- Be described in 2-3 detailed sentences suitable as an image generation prompt
- Include details about characters, setting, mood, and action
- Together, the set of illustrations should tell the visual story arc

Respond ONLY with valid JSON in this exact format:
{
  "subjects": [
    {
      "id": 1,
      "title": "Short descriptive title",
      "description": "Detailed visual description for image generation...",
      "storyContext": "Which section this covers and why this moment was chosen",
      "storySection": "Chapter/section identifier or approximate position"
    }
  ]
}`
  }
}
