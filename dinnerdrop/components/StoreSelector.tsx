'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { GroceryCategory, GroceryItem } from '@/types'

interface StoreSelectorProps {
  groceryList: Record<GroceryCategory, GroceryItem[]>
}

type Store = 'instacart' | 'kroger'

export default function StoreSelector({ groceryList }: StoreSelectorProps) {
  const [store, setStore] = useState<Store>('instacart')
  const [loading, setLoading] = useState(false)
  const [krogerConnected, setKrogerConnected] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const supabase = createClient()

  const loadPreference = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_store, kroger_access_token, kroger_token_expires_at')
      .eq('id', user.id)
      .single()

    if (profile) {
      if (profile.preferred_store === 'kroger') {
        setStore('kroger')
      }
      const tokenValid = profile.kroger_access_token &&
        (!profile.kroger_token_expires_at || new Date(profile.kroger_token_expires_at) > new Date())
      setKrogerConnected(!!tokenValid)
    }
  }, [supabase])

  useEffect(() => {
    loadPreference()
  }, [loadPreference])

  async function savePreference(newStore: Store) {
    setStore(newStore)
    setResult(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_store: newStore })
        .eq('id', user.id)
    }
  }

  async function handleSendToInstacart() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/instacart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groceryList }),
      })

      const data = await res.json()

      if (data.link) {
        window.open(data.link, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      console.error('Error creating Instacart link:', error)
      setResult({ type: 'error', message: 'Failed to create Instacart link.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSendToKroger() {
    if (!krogerConnected) {
      window.location.href = '/api/kroger/auth'
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/kroger/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groceryList }),
      })

      const data = await res.json()

      if (res.status === 403) {
        // Token expired, need to reconnect
        setKrogerConnected(false)
        setResult({ type: 'error', message: 'Kroger session expired. Please reconnect.' })
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add to cart')
      }

      setResult({
        type: 'success',
        message: `Added ${data.added} of ${data.total} items to your Kroger cart.`,
      })
    } catch (error) {
      console.error('Kroger cart error:', error)
      setResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add items to Kroger cart.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Store toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => savePreference('instacart')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            store === 'instacart'
              ? 'bg-[#43B02A] text-white'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Instacart
        </button>
        <button
          onClick={() => savePreference('kroger')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors border-l border-border ${
            store === 'kroger'
              ? 'bg-[#0067A0] text-white'
              : 'bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          Kroger
        </button>
      </div>

      {/* Action button */}
      {store === 'instacart' ? (
        <button
          onClick={handleSendToInstacart}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#43B02A] text-white font-semibold text-base hover:bg-[#3a9a24] disabled:opacity-50 transition-colors shadow-lg"
        >
          {loading ? 'Creating list...' : 'Send to Instacart'}
        </button>
      ) : krogerConnected ? (
        <button
          onClick={handleSendToKroger}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#0067A0] text-white font-semibold text-base hover:bg-[#005a8c] disabled:opacity-50 transition-colors shadow-lg"
        >
          {loading ? 'Adding to cart...' : 'Send to Kroger'}
        </button>
      ) : (
        <button
          onClick={() => { window.location.href = '/api/kroger/auth' }}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#0067A0] text-white font-semibold text-base hover:bg-[#005a8c] transition-colors shadow-lg"
        >
          Connect your Kroger account
        </button>
      )}

      {/* Result message */}
      {result && (
        <p className={`text-sm ${result.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
