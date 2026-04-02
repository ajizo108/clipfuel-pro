// pages/api/checkout.js
import Stripe from 'stripe'

// 🔥 Initialize Stripe safely
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { email } = req.body || {};
    // 🔍 DEBUG (you can remove later)
    console.log('STRIPE KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded ✅' : 'Missing ❌')
    console.log('PRICE ID:', process.env.STRIPE_PRICE_ID)

    // 🚨 Check for missing env vars
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY in .env.local' })
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: 'Missing STRIPE_PRICE_ID in .env.local' })
    }

    if (!process.env.NEXTAUTH_URL) {
      return res.status(500).json({ error: 'Missing NEXTAUTH_URL in .env.local' })
    }

    // 🚀 Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Attach the user's email (prefills checkout & ensures webhook has email)
      ...(email ? { customer_email: email } : {}),
      success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('❌ Stripe Checkout Error:', error.message)
    return res.status(500).json({ error: error.message })
  }
}