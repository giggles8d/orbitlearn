'use client'

import { useState } from 'react'
import type { GroceryCategory, GroceryItem } from '@/types'

interface InstacartButtonProps {
  groceryList: Record<GroceryCategory, GroceryItem[]>
}

export default function InstacartButton({ groceryList }: InstacartButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSendToInstacart() {
    setLoading(true)

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSendToInstacart}
      disabled={loading}
      className="w-full sm:w-auto px-8 py-3 rounded-lg bg-[#43B02A] text-white font-semibold text-base hover:bg-[#3a9a24] disabled:opacity-50 transition-colors shadow-lg"
    >
      {loading ? 'Creating list...' : 'Send to Instacart'}
    </button>
  )
}
