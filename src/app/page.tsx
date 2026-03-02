import Link from 'next/link'
import { BookOpen, Upload, Sparkles, Palette, Download, ArrowRight } from 'lucide-react'
import { HOMEPAGE_SHOWCASE } from '@/lib/gallery/showcase-data'
import { GalleryCard } from '@/components/marketing/gallery-card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-orange-600" />
            <span className="text-lg font-bold text-gray-900">Book Illustrator</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Create Beautiful Book Illustrations{' '}
            <span className="text-orange-600">with AI</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Upload your story, let AI analyze it and suggest illustrations,
            choose your style and palette, and generate professional-quality
            book covers and interior illustrations in minutes.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white hover:bg-orange-700"
            >
              Start for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-3 text-sm text-gray-400">3 free credits on signup</p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Upload,
                title: '1. Upload Story',
                description: 'Upload your story as .txt, .pdf, or .docx, or simply paste the text.',
              },
              {
                icon: Sparkles,
                title: '2. AI Suggests',
                description: 'AI reads your story and suggests the best scenes to illustrate.',
              },
              {
                icon: Palette,
                title: '3. Customize',
                description: 'Choose from 10 art styles, 10 color palettes, and 9 book formats.',
              },
              {
                icon: Download,
                title: '4. Download',
                description: 'Generate and download print-ready illustrations at 300 DPI.',
              },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <Icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Example Gallery */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-3 text-center text-3xl font-bold text-gray-900">See What&apos;s Possible</h2>
          <p className="mb-12 text-center text-gray-500">
            Real illustrations created with our AI engine. Choose from 10 unique art styles.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOMEPAGE_SHOWCASE.map((item, i) => (
              <GalleryCard key={item.id} item={item} priority={i < 3} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              View all styles in the full gallery
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-center text-sm text-gray-400">
            Every image above was generated in under 60 seconds
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Three Generation Modes</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Book Cover',
                description: 'Generate a stunning cover illustration with space reserved for your title text.',
              },
              {
                title: 'Single Illustration',
                description: 'Create one key illustration capturing the most impactful scene of your story.',
              },
              {
                title: 'Full Book',
                description: 'Generate illustrations for every key section of your story in one go.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-2 font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-gray-100 bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Simple Credit Pricing</h2>
          <p className="mb-8 text-gray-500">1 credit = 1 illustration. Buy what you need.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: '5 Credits', price: '$4.99', per: '$1.00/each' },
              { name: '15 Credits', price: '$11.99', per: '$0.80/each', popular: true },
              { name: '50 Credits', price: '$29.99', per: '$0.60/each' },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border bg-white p-6 ${
                  plan.popular ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <p className="mb-2 text-xs font-semibold text-orange-600">MOST POPULAR</p>
                )}
                <p className="text-lg font-bold text-gray-900">{plan.name}</p>
                <p className="text-2xl font-bold text-orange-600">{plan.price}</p>
                <p className="text-sm text-gray-500">{plan.per}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-gray-400">
            Book Illustrator - AI-powered book illustrations
          </p>
        </div>
      </footer>
    </div>
  )
}
