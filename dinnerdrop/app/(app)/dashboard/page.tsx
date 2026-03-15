'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import MealGrid from '@/components/MealGrid'
import type { Meal } from '@/types'

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const [budget, setBudget] = useState('$100')
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [favoriteNames, setFavoriteNames] = useState<Set<string>>(new Set())
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free')
  const [planCount, setPlanCount] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
  const canGenerate = isSubscribed || planCount === 0

  const loadExistingPlan = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setBudget(profile.weekly_budget)
      setSubscriptionStatus(profile.subscription_status || 'free')

      if (!profile.onboarding_complete) {
        router.push('/onboarding')
        return
      }
    }

    // Load favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('meal_name')
      .eq('user_id', user.id)

    if (favorites) {
      setFavoriteNames(new Set(favorites.map(f => f.meal_name)))
    }

    // Load most recent meal plan
    const { data: plan } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (plan) {
      const planMeals = plan.meals as Meal[]
      setMeals(planMeals)
      setTotalCost(plan.total_estimated_cost || 0)
      setHasGenerated(true)
      localStorage.setItem('current-meals', JSON.stringify(planMeals))
    }

    // Count total plans generated
    const { count } = await supabase
      .from('meal_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    setPlanCount(count ?? 0)
  }, [supabase, router])

  useEffect(() => {
    loadExistingPlan()
  }, [loadExistingPlan])

  // Refresh subscription status when returning from Stripe
  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      const refresh = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single()
        if (profile) {
          setSubscriptionStatus(profile.subscription_status || 'free')
        }
      }
      refresh()
    }
  }, [searchParams, supabase])

  async function toggleFavorite(meal: Meal) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isFav = favoriteNames.has(meal.name)

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('meal_name', meal.name)

      setFavoriteNames(prev => {
        const next = new Set(prev)
        next.delete(meal.name)
        return next
      })
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        meal_name: meal.name,
        meal_data: meal,
      })

      setFavoriteNames(prev => new Set(prev).add(meal.name))
    }
  }

  async function generatePlan() {
    if (!canGenerate) {
      router.push('/subscribe')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return

    // Fetch favorite meals to include in generation
    const { data: favorites } = await supabase
      .from('favorites')
      .select('meal_data')
      .eq('user_id', user.id)

    const favoriteMeals = favorites?.map(f => f.meal_data as Meal) || []

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familySize: profile.family_size,
          weeklyBudget: profile.weekly_budget,
          maxCookTime: profile.max_cook_time,
          cuisinePreference: profile.cuisine_preference,
          dietaryNeeds: profile.dietary_needs || [],
          favoriteMeals,
        }),
      })

      const data = await res.json()

      if (data.meals) {
        setMeals(data.meals)
        setTotalCost(data.totalEstimatedCost)
        setHasGenerated(true)
        setPlanCount(prev => prev + 1)
        localStorage.setItem('current-meals', JSON.stringify(data.meals))

        const today = new Date()
        const monday = new Date(today)
        monday.setDate(today.getDate() - today.getDay() + 1)

        await supabase.from('meal_plans').insert({
          user_id: user.id,
          week_start: monday.toISOString().split('T')[0],
          meals: data.meals,
          grocery_list: {},
          total_estimated_cost: data.totalEstimatedCost,
        })
      }
    } catch (error) {
      console.error('Error generating plan:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Subscription banner */}
        {!isSubscribed && (
          <Link
            href="/subscribe"
            className="flex items-center gap-3 mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Start your free trial to generate unlimited meal plans
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {planCount === 0
                  ? 'Try one plan free, then $9/month for unlimited plans.'
                  : 'You\u2019ve used your free plan. Upgrade to keep generating.'}
              </p>
            </div>
            <span className="flex-shrink-0 text-xs font-medium text-primary">
              Upgrade &rarr;
            </span>
          </Link>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              This week&apos;s dinners
            </h1>
            <p className="text-muted-foreground mt-1">
              5 meals planned around your budget and preferences
            </p>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading
              ? 'Generating...'
              : !canGenerate
                ? 'Upgrade to generate'
                : hasGenerated
                  ? 'Generate new week'
                  : 'Generate my plan'}
          </button>
        </div>

        <MealGrid
          meals={meals}
          loading={loading}
          favoriteNames={favoriteNames}
          onToggleFavorite={toggleFavorite}
        />

        {hasGenerated && meals.length > 0 && (
          <>
            <div className="mt-8 p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Estimated total
                </span>
                <span className="text-sm text-muted-foreground">
                  Budget: {budget}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (totalCost / parseFloat(budget.replace('$', '').replace('+', ''))) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/grocery-list"
                className="inline-block px-8 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Build my grocery list &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
