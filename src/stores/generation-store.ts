import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'
import type { Subject, Character, CharacterReference, GenerationMode, GenerationStatus } from '@/types/generation'
import type { BookProfile } from '@/types/book-profile'

interface GenerationState {
  storyId: string | null
  storyText: string | null
  storyFilename: string | null
  bookProfile: BookProfile | null
  mode: GenerationMode | null
  characters: Character[]
  approvedCharacterRefs: CharacterReference[]
  subjects: Subject[]
  selectedSubjects: Subject[]
  style: StylePresetId | null
  palette: PalettePresetId | 'custom' | null
  customPalettePrompt: string
  bookFormatId: string | null
  generatedImages: Array<{ url: string; subjectId: number }>
  status: GenerationStatus

  setStoryId: (id: string) => void
  setStory: (text: string, filename?: string) => void
  setBookProfile: (profile: BookProfile) => void
  setMode: (mode: GenerationMode) => void
  setCharacters: (characters: Character[]) => void
  setApprovedCharacterRefs: (refs: CharacterReference[]) => void
  addApprovedCharacterRef: (ref: CharacterReference) => void
  removeApprovedCharacterRef: (characterName: string) => void
  setSubjects: (subjects: Subject[]) => void
  selectSubject: (subject: Subject) => void
  deselectSubject: (subjectId: number) => void
  replaceSubject: (oldId: number, newSubject: Subject) => void
  setStyle: (style: StylePresetId) => void
  setPalette: (palette: PalettePresetId | 'custom', customPrompt?: string) => void
  setBookFormat: (formatId: string) => void
  addGeneratedImage: (url: string, subjectId: number) => void
  setStatus: (status: GenerationStatus) => void
  reset: () => void
}

const initialState = {
  storyId: null as string | null,
  storyText: null,
  storyFilename: null,
  bookProfile: null as BookProfile | null,
  mode: null,
  characters: [] as Character[],
  approvedCharacterRefs: [] as CharacterReference[],
  subjects: [],
  selectedSubjects: [],
  style: null,
  palette: null,
  customPalettePrompt: '',
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
      setBookProfile: (profile) => set({ bookProfile: profile }),
      setMode: (mode) => set({ mode, characters: [], approvedCharacterRefs: [], subjects: [], selectedSubjects: [] }),
      setCharacters: (characters) => set({ characters }),
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
      setStyle: (style) => set({ style }),
      setPalette: (palette, customPrompt) => set({
        palette,
        customPalettePrompt: customPrompt ?? '',
      }),
      setBookFormat: (formatId) => set({ bookFormatId: formatId }),
      addGeneratedImage: (url, subjectId) => set((state) => ({
        generatedImages: [...state.generatedImages, { url, subjectId }],
      })),
      setStatus: (status) => set({ status }),
      reset: () => set(initialState),
    }),
    {
      name: 'generation-wizard',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      partialize: (state) => ({
        storyId: state.storyId,
        storyText: state.storyText,
        storyFilename: state.storyFilename,
        bookProfile: state.bookProfile,
        mode: state.mode,
        characters: state.characters,
        approvedCharacterRefs: state.approvedCharacterRefs,
        subjects: state.subjects,
        selectedSubjects: state.selectedSubjects,
        style: state.style,
        palette: state.palette,
        customPalettePrompt: state.customPalettePrompt,
        bookFormatId: state.bookFormatId,
      }),
    }
  )
)
