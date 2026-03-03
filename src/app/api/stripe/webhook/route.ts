import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripeInstance() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const stripe = getStripeInstance()
  const supabaseAdmin = getSupabaseAdmin()

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits ?? '0', 10)

    if (userId && credits > 0) {
      const { error } = await supabaseAdmin.rpc('adjust_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_type: 'purchase',
        p_description: `Purchased ${credits} credits (Stripe: ${session.id})`,
        p_stripe_session_id: session.id,
      })

      if (error) {
        console.error('Failed to adjust credits for session:', session.id, error)
        return NextResponse.json({ error: 'Credit adjustment failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
