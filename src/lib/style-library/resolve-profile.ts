import type { StyleTemplate } from './types'
import type { BookProfile, BookGenre, AgeRange } from '@/types/book-profile'

export function resolveBookProfile(
  template: StyleTemplate,
  genre: BookGenre,
  ageRange: AgeRange,
): BookProfile {
  return {
    genre,
    ageRange,
    moods: template.moods,
    characterStyle: template.characterStyle,
    illustrationType: template.illustrationType,
    era: template.era,
    culturalInfluence: template.culturalInfluence,
    detailLevel: template.detailLevel,
  }
}
