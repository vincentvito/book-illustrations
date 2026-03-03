import type { SupabaseClient } from '@supabase/supabase-js'

export async function deductCredit(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const { data, error } = await supabase.rpc('adjust_credits', {
    p_user_id: userId,
    p_amount: -amount,
    p_type: amount > 0 ? 'generation' : 'refund',
    p_description: description,
  })

  if (error) return { success: false, newBalance: 0 }
  return { success: true, newBalance: data }
}

export async function addCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  description: string,
  stripeSessionId?: string,
): Promise<{ success: boolean; newBalance: number }> {
  const { data, error } = await supabase.rpc('adjust_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: 'purchase',
    p_description: description,
    p_stripe_session_id: stripeSessionId ?? null,
  })

  if (error) return { success: false, newBalance: 0 }
  return { success: true, newBalance: data }
}
