'use client'
import { useState, useCallback } from 'react'

const STORAGE_KEY = 'world-time-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const toggleFavorite = useCallback((cityId: string) => {
    setFavorites(prev => {
      const next = prev.includes(cityId)
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((cityId: string) => {
    return favorites.includes(cityId)
  }, [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
