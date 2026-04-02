import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'
import getRawBody from 'raw-body'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const prisma = global.prisma || new PrismaClient()
if (!global.prisma) global.prisma = prisma

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

  console.log("ENV CHECK:", {
    webhook: process.env.STRIPE_WEBHOOK_SECRET,
    secret: process.env.STRIPE_SECRET_KEY,
  })

  const sig = req.headers['stripe-signature']

  let event

  try {
    const rawBody = await getRawBody(req)

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ WEBHOOK SECRET MISSING")
      return res.status(500).json({ error: "Missing webhook secret" })
    }

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

  // 🔥 HANDLE MULTIPLE SUCCESS EVENTS (important)
  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'payment_intent.succeeded'
  ) {
    let email

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      email =
        session.customer_details?.email ||
        session.customer_email ||
        session.metadata?.email
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      email = paymentIntent.receipt_email || paymentIntent.metadata?.email
    }

    console.log("💰 PAYMENT EVENT:", email)

    if (!email) {
      console.log("❌ No email found")
      return res.json({ received: true })
    }

    try {
      const existing = await prisma.stripeEvent.findUnique({
        where: { id: event.id },
      })

      if (existing) {
        console.log("⚠️ Already processed:", event.id)
        return res.json({ received: true })
      }

      await prisma.stripeEvent.create({
        data: { id: event.id },
      })

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        console.log("❌ User not found:", email)
        return res.json({ received: true })
      }

      await prisma.user.update({
        where: { email },
        data: { isPro: true },
      })

      console.log("✅ USER UPGRADED:", email)

    } catch (err) {
      console.error('❌ DB error:', err)
    }
  }

  return res.status(200).json({ received: true })
}