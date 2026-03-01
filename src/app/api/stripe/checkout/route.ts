import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { CREDIT_PACKAGES } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packageId } = await req.json()
  const pack = CREDIT_PACKAGES.find(p => p.id === packageId)
  if (!pack) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: pack.stripePriceId,
        quantity: 1,
      }],
      metadata: {
        userId: user.id,
        credits: pack.credits.toString(),
        packageId: pack.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
