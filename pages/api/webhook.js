import Stripe from 'stripe'
import getRawBody from 'raw-body'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  console.log("🔥 WEBHOOK HIT")

  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed')
  }

  const sig = req.headers['stripe-signature']
  let event

  try {
    const rawBody = await getRawBody(req)

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log("📦 EVENT TYPE:", event.type)

  } catch (err) {
    console.error('❌ Webhook verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // ✅ TEMP: Just log payments (no DB yet)
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'payment_intent.succeeded'
  ) {
    console.log("💰 PAYMENT RECEIVED:", event.type)
  }

  return res.status(200).json({ received: true })
}