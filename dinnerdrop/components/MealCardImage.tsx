'use client'

import { useUnsplashPhoto } from '@/lib/use-unsplash-photo'

interface MealCardImageProps {
  mealName: string
  dayLabel: string
}

export default function MealCardImage({ mealName, dayLabel }: MealCardImageProps) {
  const { photo, loading } = useUnsplashPhoto(mealName)

  return (
    <div className="relative h-[200px] w-full">
      {loading ? (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      ) : photo ? (
        <img
          src={photo.url}
          alt={photo.alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      <span className="absolute top-3 left-3 text-xs font-medium text-white uppercase tracking-wide drop-shadow-sm">
        {dayLabel}
      </span>
    </div>
  )
}
