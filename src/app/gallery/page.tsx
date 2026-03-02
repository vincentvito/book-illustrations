import type { Metadata } from 'next'
import { GalleryPageContent } from './gallery-content'

export const metadata: Metadata = {
  title: 'Illustration Gallery | Book Illustrator',
  description:
    'Browse AI-generated book illustrations across 10 art styles including watercolor, oil painting, manga, storybook, and more.',
}

export default function GalleryPage() {
  return <GalleryPageContent />
}
