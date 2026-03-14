import type { Meal } from '@/types'
import MealCard from './MealCard'

interface MealGridProps {
  meals: Meal[]
  loading?: boolean
  favoriteNames?: Set<string>
  onToggleFavorite?: (meal: Meal) => void
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3 animate-pulse">
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="h-4 w-1/2 bg-muted rounded" />
      <div className="h-6 w-16 bg-muted rounded-full" />
    </div>
  )
}

export default function MealGrid({ meals, loading, favoriteNames, onToggleFavorite }: MealGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {meals.map((meal) => (
        <MealCard
          key={meal.day}
          meal={meal}
          isFavorite={favoriteNames?.has(meal.name)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
