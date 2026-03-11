'use client'

import { useState } from 'react'
import type { GroceryCategory, GroceryItem } from '@/types'

interface GroceryListProps {
  groceryList: Record<GroceryCategory, GroceryItem[]>
}

const CATEGORY_ORDER: GroceryCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry & Dry Goods',
  'Frozen',
  'Bakery',
  'Beverages',
]

export default function GroceryList({ groceryList }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggleItem(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const items = groceryList[category]
        if (!items || items.length === 0) return null

        return (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {category}
            </h3>
            <ul className="space-y-2">
              {items.map((item, i) => {
                const key = `${category}-${i}`
                const isChecked = checked.has(key)

                return (
                  <li key={key} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(key)}
                      className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input hover:border-primary/50'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`text-sm ${isChecked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.quantity} {item.unit} {item.name}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
