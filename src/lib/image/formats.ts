export interface BookFormat {
  id: string
  name: string
  description: string
  widthInches: number
  heightInches: number
  widthPx: number
  heightPx: number
  aspectRatio: number
}

export const BOOK_FORMATS: BookFormat[] = [
  {
    id: 'square-8.5',
    name: "Square Children's Book",
    description: '8.5" × 8.5"',
    widthInches: 8.5, heightInches: 8.5,
    widthPx: 2550, heightPx: 2550,
    aspectRatio: 1.0,
  },
  {
    id: '6x9',
    name: '6" × 9" Paperback',
    description: 'Standard novel / trade paperback',
    widthInches: 6, heightInches: 9,
    widthPx: 1800, heightPx: 2700,
    aspectRatio: 0.667,
  },
  {
    id: 'a4',
    name: 'A4',
    description: '8.27" × 11.69" (210 × 297 mm)',
    widthInches: 8.27, heightInches: 11.69,
    widthPx: 2481, heightPx: 3508,
    aspectRatio: 0.707,
  },
  {
    id: 'a5',
    name: 'A5',
    description: '5.83" × 8.27" (148 × 210 mm)',
    widthInches: 5.83, heightInches: 8.27,
    widthPx: 1748, heightPx: 2480,
    aspectRatio: 0.705,
  },
  {
    id: 'us-letter',
    name: 'US Letter',
    description: '8.5" × 11"',
    widthInches: 8.5, heightInches: 11,
    widthPx: 2550, heightPx: 3300,
    aspectRatio: 0.773,
  },
  {
    id: '5x8',
    name: '5" × 8" Digest',
    description: 'Compact paperback',
    widthInches: 5, heightInches: 8,
    widthPx: 1500, heightPx: 2400,
    aspectRatio: 0.625,
  },
  {
    id: '7x10',
    name: '7" × 10" Textbook',
    description: 'Large format paperback',
    widthInches: 7, heightInches: 10,
    widthPx: 2100, heightPx: 3000,
    aspectRatio: 0.7,
  },
  {
    id: '8.5x11-landscape',
    name: 'US Letter Landscape',
    description: '11" × 8.5" (landscape)',
    widthInches: 11, heightInches: 8.5,
    widthPx: 3300, heightPx: 2550,
    aspectRatio: 1.294,
  },
  {
    id: 'square-10',
    name: 'Large Square',
    description: '10" × 10"',
    widthInches: 10, heightInches: 10,
    widthPx: 3000, heightPx: 3000,
    aspectRatio: 1.0,
  },
]
