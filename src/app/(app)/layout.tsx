export const dynamic = 'force-dynamic'

import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/sidebar-mobile'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
