'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const STEPS = [
  {
    question: 'How many people are you feeding?',
    field: 'familySize' as const,
    options: [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5+', value: 5 },
    ],
  },
  {
    question: "What's your weekly grocery budget?",
    field: 'weeklyBudget' as const,
    options: [
      { label: '$75', value: '$75' },
      { label: '$100', value: '$100' },
      { label: '$150', value: '$150' },
      { label: '$200', value: '$200' },
      { label: '$250+', value: '$250+' },
    ],
  },
  {
    question: 'How long can you cook on a weeknight?',
    field: 'maxCookTime' as const,
    options: [
      { label: '20 min', value: 20 },
      { label: '30 min', value: 30 },
      { label: '45 min', value: 45 },
      { label: '60 min', value: 60 },
    ],
  },
  {
    question: 'What flavors does your family love?',
    field: 'cuisinePreference' as const,
    multiSelect: true,
    options: [
      { label: 'American', value: 'American' },
      { label: 'Mexican', value: 'Mexican' },
      { label: 'Asian', value: 'Asian' },
      { label: 'Mediterranean', value: 'Mediterranean' },
      { label: 'Italian', value: 'Italian' },
      { label: 'Mix it up', value: 'mixed' },
    ],
  },
  {
    question: 'Any restrictions?',
    field: 'dietaryNeeds' as const,
    multiSelect: true,
    options: [
      { label: 'None', value: 'None' },
      { label: 'Vegetarian', value: 'Vegetarian' },
      { label: 'Vegan', value: 'Vegan' },
      { label: 'Gluten-free', value: 'Gluten-free' },
      { label: 'Dairy-free', value: 'Dairy-free' },
      { label: 'Keto', value: 'Keto' },
      { label: 'Halal', value: 'Halal' },
    ],
  },
]

interface Answers {
  familySize: number
  weeklyBudget: string
  maxCookTime: number
  cuisinePreference: string[]
  dietaryNeeds: string[]
}

export default function OnboardingQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({
    familySize: 2,
    weeklyBudget: '$100',
    maxCookTime: 30,
    cuisinePreference: [],
    dietaryNeeds: [],
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentStep = STEPS[step]

  function handleSelect(value: string | number) {
    const field = currentStep.field

    if (currentStep.multiSelect) {
      const current = answers[field] as string[]
      if (value === 'None') {
        setAnswers({ ...answers, [field]: ['None'] })
      } else {
        const filtered = current.filter((v) => v !== 'None')
        if (filtered.includes(value as string)) {
          setAnswers({ ...answers, [field]: filtered.filter((v) => v !== value) })
        } else {
          setAnswers({ ...answers, [field]: [...filtered, value as string] })
        }
      }
    } else {
      setAnswers({ ...answers, [field]: value })
      // Auto-advance for single-select
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 200)
      }
    }
  }

  function isSelected(value: string | number) {
    const field = currentStep.field
    if (currentStep.multiSelect) {
      return (answers[field] as string[]).includes(value as string)
    }
    return answers[field] === value
  }

  async function handleSubmit() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const cuisinePref = answers.cuisinePreference.length > 0
      ? answers.cuisinePreference.join(', ')
      : 'mixed'

    const dietaryNeeds = answers.dietaryNeeds.filter((v) => v !== 'None')

    const { error } = await supabase
      .from('profiles')
      .update({
        family_size: answers.familySize,
        weekly_budget: answers.weeklyBudget,
        max_cook_time: answers.maxCookTime,
        cuisine_preference: cuisinePref,
        dietary_needs: dietaryNeeds,
        onboarding_complete: true,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error saving profile:', error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress bar */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            {currentStep.question}
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {currentStep.options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => handleSelect(option.value)}
              className={`px-6 py-3 rounded-full border text-sm font-medium transition-all ${
                isSelected(option.value)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-input hover:border-primary/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
          >
            Back
          </button>

          {currentStep.multiSelect && !isLastStep && (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          )}

          {isLastStep && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Get my meal plan'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
