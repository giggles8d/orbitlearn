'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import type { Meal } from '@/types'

interface MealCardProps {
  meal: Meal
  isFavorite?: boolean
  onToggleFavorite?: (meal: Meal) => void
}

function getMealId(meal: Meal) {
  return meal.day.toLowerCase()
}

export default function MealCard({ meal, isFavorite, onToggleFavorite }: MealCardProps) {
  function handleClick() {
    localStorage.setItem(`meal-${getMealId(meal)}`, JSON.stringify(meal))
  }

  return (
    <div className="rounded-lg border border-border bg-card hover:shadow-md transition-shadow relative">
      <div className="flex items-start justify-between p-5 pb-0">
        <p className="text-xs font-medium text-primary uppercase tracking-wide">
          {meal.day}
        </p>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite(meal)
            }}
            className="p-1 -m-1 rounded-full hover:bg-muted transition-colors relative z-10"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground hover:text-red-400'
              }`}
            />
          </button>
        )}
      </div>
      <Link
        href={`/recipe/${getMealId(meal)}`}
        onClick={handleClick}
        className="block p-5 pt-3 space-y-3"
      >
        <h3 className="text-lg font-heading font-semibold text-card-foreground leading-tight">
          {meal.name}
        </h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{meal.cookTime} min</span>
          <span>&middot;</span>
          <span>{meal.servings} servings</span>
        </div>
        <div className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          ${meal.estimatedCost.toFixed(2)}
        </div>
      </Link>
    </div>
  )
}
