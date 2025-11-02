'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { StructuredSearch } from '@/components/StructuredSearch'
import { IngredientDetailModal, useIngredientModal } from '@/components/IngredientDetailModal'
import { 
  Ingredient, 
  CompositionState 
} from '@/types'
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/api'

const initialComposition: CompositionState = {
  ingredients: [],
  result: undefined
}

export default function HomePage() {
  const [composition, setComposition] = useState<CompositionState>(initialComposition)
  const { ingredientId, openModal, closeModal } = useIngredientModal()

  // Load saved state on mount
  useEffect(() => {
    const savedComposition = loadFromLocalStorage<CompositionState>('umami-composition')
    if (savedComposition) {
      setComposition(savedComposition)
    }

    // Check for shared state in URL hash
    const hash = window.location.hash
    if (hash.startsWith('#state=')) {
      try {
        const stateString = hash.substring(7)
        const decodedState = JSON.parse(atob(stateString))
        if (decodedState.ingredients) {
          setComposition(decodedState)
        }
      } catch (error) {
        console.error('Error loading shared state:', error)
      }
    }
  }, [])

  // Auto-save composition
  useEffect(() => {
    if (composition.ingredients.length > 0) {
      saveToLocalStorage('umami-composition', composition)
    }
  }, [composition])

  const handleAddToComposition = (ingredient: Ingredient) => {
    const exists = composition.ingredients.some(
      item => item.ingredient.id === ingredient.id
    )
    
    if (!exists) {
      const newComposition = {
        ...composition,
        ingredients: [...composition.ingredients, { ingredient, quantity: 100, unit: 'g' as const }]
      }
      setComposition(newComposition)
    }
  }

  const handleOpenDetails = (ingredient: Ingredient) => {
    openModal(ingredient.id)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* 1. Title */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Umami Builder
            </h1>
          </div>

          {/* 2. Subtitle */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-base sm:text-lg text-gray-600">
              Search and pair umami across different foods.
            </p>
          </div>

          {/* 3. Search Bar (44px height) */}
          <div className="max-w-4xl mx-auto">
            <StructuredSearch
              onAddToComposition={handleAddToComposition}
              onOpenDetails={handleOpenDetails}
              composition={composition}
              onChange={setComposition}
            />
          </div>
        </div>
      </main>
      
      {/* Ingredient Detail Modal */}
      <IngredientDetailModal
        ingredientId={ingredientId}
        onClose={closeModal}
        onAddToComposition={handleAddToComposition}
      />
    </div>
  )
}
