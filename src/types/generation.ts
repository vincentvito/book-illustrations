export interface Character {
  name: string
  appearance: string
}

export interface Subject {
  id: number
  title: string
  description: string
  storyContext: string
  storySection?: string
}

export interface AnalysisResponse {
  characters?: Character[]
  subjects: Subject[]
}

export type GenerationMode = 'cover' | 'single' | 'all'
export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'processing' | 'completed' | 'error'
