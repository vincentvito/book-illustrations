'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Card>
      <div className="mb-6 text-center">
        <BookOpen className="mx-auto mb-2 h-10 w-10 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500">Start creating book illustrations with AI</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          id="name"
          label="Full name"
          type="text"
          placeholder="Your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>

      <p className="mt-2 text-center text-xs text-gray-400">
        You&apos;ll get 3 free credits to start
      </p>
    </Card>
  )
}
