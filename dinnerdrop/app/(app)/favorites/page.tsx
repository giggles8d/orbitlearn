'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Meal } from '@/types'

interface FavoriteRow {
  id: string
  meal_name: string
  meal_data: Meal
  created_at: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const loadFavorites = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      setFavorites(data as FavoriteRow[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  async function removeFavorite(id: string) {
    await supabase.from('favorites').delete().eq('id', id)
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Your favorite meals
          </h1>
          <p className="text-muted-foreground mt-1">
            Meals you love will be included in future plans automatically.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-foreground font-medium">No favorites yet</p>
            <p className="text-muted-foreground text-sm">
              Tap the heart icon on any meal card to save it here.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Go to dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favorites.map((fav) => {
              const meal = fav.meal_data
              return (
                <div
                  key={fav.id}
                  className="rounded-lg border border-border bg-card p-5 space-y-3 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {meal.day}
                    </p>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="p-1 -m-1 rounded-full hover:bg-muted transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </button>
                  </div>
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
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
