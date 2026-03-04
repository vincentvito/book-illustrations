import { useEffect } from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Subject, Character, CharacterReference, Environment, EnvironmentReference, GenerationMode, GenerationStatus } from '@/types/generation'
import type { BookGenre, AgeRange } from '@/types/book-profile'

interface GenerationState {
  _hasHydrated: boolean
  storyId: string | null
  storyText: string | null
  storyFilename: string | null
  styleTemplateId: string | null
  genre: BookGenre | null
  ageRange: AgeRange | null
  mode: GenerationMode | null
  charactersExtracted: boolean
  characters: Character[]
  approvedCharacterRefs: CharacterReference[]
  environments: Environment[]
  approvedEnvironmentRefs: EnvironmentReference[]
  subjects: Subject[]
  selectedSubjects: Subject[]
  bookFormatId: string | null
  generatedImages: Array<{ url: string; subjectId: number }>
  status: GenerationStatus

  setStoryId: (id: string) => void
  setStory: (text: string, filename?: string) => void
  setStyleTemplate: (id: string) => void
  setGenre: (genre: BookGenre) => void
  setAgeRange: (ageRange: AgeRange) => void
  setMode: (mode: GenerationMode) => void
  setCharactersExtracted: (extracted: boolean) => void
  setCharacters: (characters: Character[]) => void
  setApprovedCharacterRefs: (refs: CharacterReference[]) => void
  addApprovedCharacterRef: (ref: CharacterReference) => void
  removeApprovedCharacterRef: (characterName: string) => void
  setEnvironments: (environments: Environment[]) => void
  setApprovedEnvironmentRefs: (refs: EnvironmentReference[]) => void
  addApprovedEnvironmentRef: (ref: EnvironmentReference) => void
  removeApprovedEnvironmentRef: (environmentName: string) => void
  setSubjects: (subjects: Subject[]) => void
  selectSubject: (subject: Subject) => void
  deselectSubject: (subjectId: number) => void
  replaceSubject: (oldId: number, newSubject: Subject) => void
  addSubject: (subject: Subject) => void
  removeSubject: (subjectId: number) => void
  setBookFormat: (formatId: string) => void
  renameCharacterInSubjects: (oldName: string, newName: string) => void
  addGeneratedImage: (url: string, subjectId: number) => void
  replaceGeneratedImage: (subjectId: number, newUrl: string) => void
  setStatus: (status: GenerationStatus) => void
  reset: () => void
}

const initialState = {
  _hasHydrated: false,
  storyId: null as string | null,
  storyText: null,
  storyFilename: null,
  styleTemplateId: null as string | null,
  genre: null as BookGenre | null,
  ageRange: null as AgeRange | null,
  mode: null,
  charactersExtracted: false,
  characters: [] as Character[],
  approvedCharacterRefs: [] as CharacterReference[],
  environments: [] as Environment[],
  approvedEnvironmentRefs: [] as EnvironmentReference[],
  subjects: [],
  selectedSubjects: [],
  bookFormatId: null,
  generatedImages: [],
  status: 'idle' as GenerationStatus,
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      ...initialState,

      setStoryId: (id) => set({ storyId: id }),
      setStory: (text, filename) => set({ storyText: text, storyFilename: filename ?? null }),
      setStyleTemplate: (id) => set({ styleTemplateId: id }),
      setGenre: (genre) => set({ genre }),
      setAgeRange: (ageRange) => set({ ageRange }),
      setMode: (mode) => set({ mode, charactersExtracted: false, characters: [], approvedCharacterRefs: [], environments: [], approvedEnvironmentRefs: [], subjects: [], selectedSubjects: [] }),
      setCharactersExtracted: (extracted) => set({ charactersExtracted: extracted }),
      setCharacters: (characters) => set((state) => ({
        characters,
        // Clear subjects when characters change (forces re-analysis with new characters)
        ...(state.subjects.length > 0 ? { subjects: [], selectedSubjects: [] } : {}),
      })),
      setApprovedCharacterRefs: (refs) => set({ approvedCharacterRefs: refs }),
      addApprovedCharacterRef: (ref) => set((state) => ({
        approvedCharacterRefs: [
          ...state.approvedCharacterRefs.filter(r => r.characterName !== ref.characterName),
          ref,
        ],
      })),
      removeApprovedCharacterRef: (characterName) => set((state) => ({
        approvedCharacterRefs: state.approvedCharacterRefs.filter(r => r.characterName !== characterName),
      })),
      setEnvironments: (environments) => set({ environments }),
      setApprovedEnvironmentRefs: (refs) => set({ approvedEnvironmentRefs: refs }),
      addApprovedEnvironmentRef: (ref) => set((state) => ({
        approvedEnvironmentRefs: [
          ...state.approvedEnvironmentRefs.filter(r => r.environmentName !== ref.environmentName),
          ref,
        ],
      })),
      removeApprovedEnvironmentRef: (environmentName) => set((state) => ({
        approvedEnvironmentRefs: state.approvedEnvironmentRefs.filter(r => r.environmentName !== environmentName),
      })),
      setSubjects: (subjects) => set({ subjects }),
      selectSubject: (subject) => set((state) => ({
        selectedSubjects: state.mode === 'all'
          ? [...state.selectedSubjects, subject]
          : [subject],
      })),
      deselectSubject: (subjectId) => set((state) => ({
        selectedSubjects: state.selectedSubjects.filter(s => s.id !== subjectId),
      })),
      replaceSubject: (oldId, newSubject) => set((state) => ({
        subjects: state.subjects.map(s => s.id === oldId ? newSubject : s),
        selectedSubjects: state.selectedSubjects.map(s => s.id === oldId ? newSubject : s),
      })),
      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, subject],
      })),
      removeSubject: (subjectId) => set((state) => ({
        subjects: state.subjects.filter(s => s.id !== subjectId),
        selectedSubjects: state.selectedSubjects.filter(s => s.id !== subjectId),
      })),
      setBookFormat: (formatId) => set({ bookFormatId: formatId }),
      renameCharacterInSubjects: (oldName, newName) => set((state) => {
        const rename = (chars?: string[]) =>
          chars?.map(c => c === oldName ? newName : c)
        return {
          subjects: state.subjects.map(s => ({ ...s, characters: rename(s.characters) })),
          selectedSubjects: state.selectedSubjects.map(s => ({ ...s, characters: rename(s.characters) })),
        }
      }),
      addGeneratedImage: (url, subjectId) => set((state) => ({
        generatedImages: [...state.generatedImages, { url, subjectId }],
      })),
      replaceGeneratedImage: (subjectId, newUrl) => set((state) => {
        const images = [...state.generatedImages]
        const index = images.findIndex(img => img.subjectId === subjectId)
        if (index >= 0) {
          images[index] = { url: newUrl, subjectId }
        } else {
          images.push({ url: newUrl, subjectId })
        }
        return { generatedImages: images }
      }),
      setStatus: (status) => set({ status }),
      reset: () => set({ ...initialState, _hasHydrated: true }),
    }),
    {
      name: 'generation-wizard',
      storage: createJSONStorage(() => sessionStorage),
      version: 4,
      migrate: (_persisted, version) => {
        if (version < 4) {
          return { ...initialState, _hasHydrated: true }
        }
        return _persisted as Partial<GenerationState>
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.error('Zustand rehydration error:', error)
        useGenerationStore.setState({ _hasHydrated: true })
      },
      partialize: (state) => ({
        storyId: state.storyId,
        storyText: state.storyText,
        storyFilename: state.storyFilename,
        styleTemplateId: state.styleTemplateId,
        genre: state.genre,
        ageRange: state.ageRange,
        mode: state.mode,
        charactersExtracted: state.charactersExtracted,
        characters: state.characters,
        approvedCharacterRefs: state.approvedCharacterRefs,
        environments: state.environments,
        approvedEnvironmentRefs: state.approvedEnvironmentRefs,
        subjects: state.subjects,
        selectedSubjects: state.selectedSubjects,
        bookFormatId: state.bookFormatId,
        generatedImages: state.generatedImages,
      }),
    }
  )
)

/** Safety net: forces _hasHydrated after 3 s if Zustand persist never fires. */
export function useHydrationGuard() {
  const hasHydrated = useGenerationStore((s) => s._hasHydrated)
  useEffect(() => {
    if (hasHydrated) return
    const timer = setTimeout(() => {
      console.warn('Zustand hydration timeout — forcing _hasHydrated')
      useGenerationStore.setState({ _hasHydrated: true })
    }, 3000)
    return () => clearTimeout(timer)
  }, [hasHydrated])
  return hasHydrated
}
