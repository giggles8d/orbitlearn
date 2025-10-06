export async function POST() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return new Response('Stripe not configured', { status: 501 })
  }
  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(key, { apiVersion: '2024-06-20' as any })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      { price_data: { currency: 'usd', product_data: { name: 'Course Purchase' }, unit_amount: 9900 }, quantity: 1 }
    ],
    success_url: 'http://localhost:3000/dashboard?success=1',
    cancel_url: 'http://localhost:3000/dashboard?canceled=1'
  })
  return Response.json({ url: session.url })
}
