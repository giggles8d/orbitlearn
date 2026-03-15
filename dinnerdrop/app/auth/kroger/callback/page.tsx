'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

function KrogerCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error || !code) {
        setStatus('error')
        setErrorMessage(error || 'No authorization code received')
        return
      }

      try {
        const res = await fetch('/api/kroger/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Token exchange failed')
        }

        // Update preferred store to kroger
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase
            .from('profiles')
            .update({ preferred_store: 'kroger' })
            .eq('id', user.id)
        }

        setStatus('success')
        setTimeout(() => router.push('/grocery-list'), 2000)
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
      }
    }

    handleCallback()
  }, [searchParams, router, supabase])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        {status === 'loading' && (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-foreground font-medium">Connecting your Kroger account...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-foreground font-medium">Kroger account connected!</p>
            <p className="text-sm text-muted-foreground">Redirecting to your grocery list...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-foreground font-medium">Connection failed</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Link
              href="/grocery-list"
              className="inline-block mt-2 px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Back to grocery list
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function KrogerCallbackPage() {
  return (
    <Suspense>
      <KrogerCallbackContent />
    </Suspense>
  )
}
