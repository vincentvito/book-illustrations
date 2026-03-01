export interface Subject {
  id: number
  title: string
  description: string
  storyContext: string
  storySection?: string
}

export interface AnalysisResponse {
  subjects: Subject[]
}

export type GenerationMode = 'cover' | 'single' | 'all'
export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'processing' | 'completed' | 'error'
