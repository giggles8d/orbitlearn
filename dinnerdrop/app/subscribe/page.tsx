'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChefHat, ShoppingCart, Sparkles, Zap } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const features = [
    { icon: Sparkles, text: 'Unlimited weekly meal plans' },
    { icon: ChefHat, text: '5 dinners per week, personalized to your family' },
    { icon: ShoppingCart, text: 'One-tap Instacart grocery cart push' },
    { icon: Zap, text: 'Smart budget optimization' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 max-w-3xl flex items-center justify-between">
          <Link href="/" className="font-heading text-xl font-bold text-foreground">
            DinnerDrop
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Maybe later
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Upgrade to Basic
            </h1>
            <p className="text-muted-foreground">
              Spend less time planning, more time eating together.
            </p>
          </div>

          <div className="rounded-xl border-2 border-primary bg-card p-6 mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-heading font-bold text-foreground">$9</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              7-day free trial included. Cancel anytime.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Redirecting to checkout...' : 'Start free trial'}
            </button>

            {error && (
              <p className="mt-3 text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Secure payment powered by Stripe
            </p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Check key={i} className="w-3 h-3 text-muted-foreground" />
              ))}
            </div>
            <div className="flex justify-center gap-3 text-xs text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
