import { Image } from 'lucide-react'

export default function AmbientLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ambient Library</h1>
        <p className="text-gray-500">
          Save and reuse background environments for consistent scene settings
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-12">
        <Image className="h-12 w-12 text-gray-300" />
        <div className="text-center">
          <p className="font-medium text-gray-900">No ambients yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Generate and save background environments for reuse across your
            stories. Coming soon.
          </p>
        </div>
      </div>
    </div>
  )
}
