'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import MealCardImage from './MealCardImage'
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
    <div className="rounded-lg border border-border bg-card hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/recipe/${getMealId(meal)}`} onClick={handleClick} className="block">
        <MealCardImage mealName={meal.name} dayLabel={meal.day} />
      </Link>

      <div className="relative">
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleFavorite(meal)
            }}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-muted-foreground hover:text-red-400'
              }`}
            />
          </button>
        )}
        <Link
          href={`/recipe/${getMealId(meal)}`}
          onClick={handleClick}
          className="block p-4 space-y-2"
        >
          <h3 className="text-base font-heading font-semibold text-card-foreground leading-tight pr-8">
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
    </div>
  )
}
