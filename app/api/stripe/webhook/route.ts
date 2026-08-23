import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseServer } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      // Store donation in database
      const { error } = await (supabaseServer.from('donations') as any).insert({
        amount: (session.amount_total || 0) / 100, // Convert from cents
        currency: session.currency || 'eur',
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'completed',
        donor_email: session.customer_details?.email || null,
        donor_name: session.customer_details?.name || null,
        is_anonymous: false,
        completed_at: new Date().toISOString(),
      })

      if (error) {
        console.error('Error storing donation:', error)
      }

      break
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session

      // Update donation status to failed
      await (supabaseServer
        .from('donations') as any)
        .update({ status: 'failed' })
        .eq('stripe_session_id', session.id)

      break
    }

    // Add more event types as needed

    default: {
      console.log(`Unhandled event type: ${event.type}`)
    }
  }

  return NextResponse.json({ received: true })
}
