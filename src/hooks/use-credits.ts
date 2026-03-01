'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    setCredits(data?.credits ?? 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  return { credits, loading, refetch: fetchCredits }
}
