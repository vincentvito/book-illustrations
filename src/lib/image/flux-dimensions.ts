const MAX_SIDE = 2048
const ALIGNMENT = 32
const MAX_PIXELS = 9_000_000

function alignTo32(value: number): number {
  return Math.round(value / ALIGNMENT) * ALIGNMENT
}

/**
 * Calculate FLUX 2 Pro-safe generation dimensions that preserve the target aspect ratio.
 * Constraints: max 2048 per side, multiples of 32, total ≤ 9MP.
 */
export function calculateFluxDimensions(
  targetWidth: number,
  targetHeight: number
): { width: number; height: number } {
  const aspectRatio = targetWidth / targetHeight

  let w: number
  let h: number

  if (targetWidth <= MAX_SIDE && targetHeight <= MAX_SIDE) {
    // Already fits — just align
    w = alignTo32(targetWidth)
    h = alignTo32(targetHeight)
  } else if (targetWidth >= targetHeight) {
    // Landscape or square — cap width at 2048
    w = MAX_SIDE
    h = alignTo32(MAX_SIDE / aspectRatio)
  } else {
    // Portrait — cap height at 2048
    h = MAX_SIDE
    w = alignTo32(MAX_SIDE * aspectRatio)
  }

  // Alignment might push a side over 2048
  if (w > MAX_SIDE) w = MAX_SIDE
  if (h > MAX_SIDE) h = MAX_SIDE

  // Safety net for total megapixels (shouldn't trigger with 2048 cap)
  if (w * h > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / (w * h))
    w = alignTo32(w * scale)
    h = alignTo32(h * scale)
  }

  return { width: w, height: h }
}
