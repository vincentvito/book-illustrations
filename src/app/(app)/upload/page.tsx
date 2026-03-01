'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileDropzone } from '@/components/upload/file-dropzone'
import { TextPasteArea } from '@/components/upload/text-paste-area'
import { StoryPreview } from '@/components/upload/story-preview'
import { Button } from '@/components/ui/button'
import { useGenerationStore } from '@/stores/generation-store'
import { ArrowRight } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const { storyText, storyFilename, setStory, setStoryId, reset } = useGenerationStore()
  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleFileAccepted = (text: string, filename: string) => {
    setStory(text, filename)
  }

  const handleTextSubmit = (text: string) => {
    setStory(text)
  }

  const handleClear = () => {
    reset()
  }

  const handleContinue = async () => {
    if (!storyText) return
    setCreating(true)
    try {
      const title = storyFilename
        ? storyFilename.replace(/\.\w+$/, '')
        : storyText.split('\n')[0].slice(0, 100) || 'Untitled Story'

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          story_text: storyText,
          filename: storyFilename,
        }),
      })

      if (res.ok) {
        const { story } = await res.json()
        setStoryId(story.id)
      }

      router.push('/generate/profile')
    } catch {
      router.push('/generate/profile')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Your Story</h1>
        <p className="text-gray-500">Upload a file or paste your story text to get started</p>
      </div>

      {storyText ? (
        <div className="space-y-4">
          <StoryPreview
            text={storyText}
            filename={storyFilename}
            onClear={handleClear}
          />
          <div className="flex justify-end">
            <Button onClick={handleContinue} loading={creating}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <FileDropzone onFileAccepted={handleFileAccepted} loading={uploading} />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-3 text-sm text-gray-500">or</span>
            </div>
          </div>
          <TextPasteArea onTextSubmit={handleTextSubmit} />
        </div>
      )}
    </div>
  )
}
