'use client'
import { Sun, Moon } from 'lucide-react'
import { ThemeMode } from '../types'

interface ThemeToggleProps {
  theme: ThemeMode
  onToggle: () => void
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center
        bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20
        border border-white/20 dark:border-white/10
        text-gray-700 dark:text-gray-200
        transition-all duration-200 hover:scale-105 active:scale-95"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-yellow-400" />
      ) : (
        <Moon size={18} className="text-indigo-500" />
      )}
    </button>
  )
}
