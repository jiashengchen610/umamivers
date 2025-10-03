'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CompositionRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page (which is now the composition builder)
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Redirecting to Composition Builder...</p>
      </div>
    </div>
  )
}