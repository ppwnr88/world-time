'use client'
import { useState, useEffect, useCallback } from 'react'
import { ThemeMode } from '../types'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeMode | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = stored ?? (systemDark ? 'dark' : 'light')
    setTheme(resolved)
    applyTheme(resolved)
  }, [])

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      applyTheme(next)
      return next
    })
  }, [])

  return { theme, toggle }
}
