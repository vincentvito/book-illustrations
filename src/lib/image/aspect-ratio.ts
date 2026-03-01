export const NANO_BANANA_ASPECT_RATIOS = [
  { id: '1:1' as const,   ratio: 1.0 },
  { id: '5:4' as const,   ratio: 1.25 },
  { id: '4:3' as const,   ratio: 1.333 },
  { id: '3:2' as const,   ratio: 1.5 },
  { id: '16:9' as const,  ratio: 1.778 },
  { id: '21:9' as const,  ratio: 2.333 },
  { id: '4:5' as const,   ratio: 0.8 },
  { id: '3:4' as const,   ratio: 0.75 },
  { id: '2:3' as const,   ratio: 0.667 },
  { id: '9:16' as const,  ratio: 0.5625 },
]

export type NanoBananaAspectRatio = typeof NANO_BANANA_ASPECT_RATIOS[number]['id']

export function findClosestAspectRatio(targetRatio: number): {
  id: NanoBananaAspectRatio
  ratio: number
  difference: number
} {
  let closest = NANO_BANANA_ASPECT_RATIOS[0]
  let minDiff = Math.abs(targetRatio - closest.ratio)

  for (const ar of NANO_BANANA_ASPECT_RATIOS) {
    const diff = Math.abs(targetRatio - ar.ratio)
    if (diff < minDiff) {
      minDiff = diff
      closest = ar
    }
  }

  return { id: closest.id, ratio: closest.ratio, difference: minDiff }
}
