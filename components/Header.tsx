'use client'
import { Globe, Plus, Share2, Check } from 'lucide-react'
import { useState, useCallback } from 'react'
import ThemeToggle from './ThemeToggle'
import { ThemeMode } from '../types'

interface HeaderProps {
  theme: ThemeMode
  onThemeToggle: () => void
  onAddCity: () => void
  activeCount: number
}

export default function Header({ theme, onThemeToggle, onAddCity, activeCount }: HeaderProps) {
  const [shared, setShared] = useState(false)

  const handleShare = useCallback(() => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'World Time', url }).catch(() => null)
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      })
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-black/5 dark:border-white/5 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                <Globe size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                  World Time
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  Current time worldwide
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button
                  onClick={handleShare}
                  aria-label="Share this view"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl
                    bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20
                    border border-white/20 dark:border-white/10
                    text-gray-700 dark:text-gray-200
                    transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  {shared
                    ? <><Check size={14} className="text-green-500" /> <span className="text-green-600 dark:text-green-400">Copied!</span></>
                    : <><Share2 size={14} /> <span>Share</span></>
                  }
                </button>
              )}

              <ThemeToggle theme={theme} onToggle={onThemeToggle} />

              <button
                onClick={onAddCity}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl
                  bg-blue-500 hover:bg-blue-600
                  text-white
                  transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-blue-500/30"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add City</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
