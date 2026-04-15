'use client'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Search, X, Heart, MapPin, Globe } from 'lucide-react'
import { City } from '../types'
import { CITIES, REGIONS } from '../utils/cities'

interface CitySelectorProps {
  onSelect: (cityId: string) => void
  onClose: () => void
  selectedIds: string[]
  favorites: string[]
}

export default function CitySelector({ onSelect, onClose, selectedIds, favorites }: CitySelectorProps) {
  const [query, setQuery] = useState('')
  const [activeRegion, setActiveRegion] = useState('All')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return CITIES.filter(city => {
      const matchesRegion = activeRegion === 'All' || city.region === activeRegion
      if (!matchesRegion) return false
      if (!q) return true
      return (
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q) ||
        city.timezone.toLowerCase().includes(q)
      )
    }).sort((a, b) => {
      // Favorites first
      const aFav = favorites.includes(a.id)
      const bFav = favorites.includes(b.id)
      if (aFav && !bFav) return -1
      if (!aFav && bFav) return 1
      return a.name.localeCompare(b.name)
    })
  }, [query, activeRegion, favorites])

  const handleSelect = useCallback((city: City) => {
    if (!selectedIds.includes(city.id)) {
      onSelect(city.id)
    }
  }, [onSelect, selectedIds])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 flex flex-col animate-slide-up">
        <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Select a City</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search cities, countries, timezones..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Region filter */}
          <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`
                  flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all
                  ${activeRegion === region
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }
                `}
              >
                {region}
              </button>
            ))}
          </div>

          {/* City list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MapPin size={32} className="mb-2 opacity-40" />
                <p className="text-sm">No cities found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <ul className="p-2 space-y-0.5">
                {filtered.map(city => {
                  const isSelected = selectedIds.includes(city.id)
                  const isFav = favorites.includes(city.id)

                  return (
                    <li key={city.id}>
                      <button
                        onClick={() => !isSelected && handleSelect(city)}
                        disabled={isSelected}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                          ${isSelected
                            ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-white/3'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10 cursor-pointer'
                          }
                        `}
                      >
                        <span className="text-xl leading-none flex-shrink-0">{city.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {city.name}
                            </span>
                            {isFav && (
                              <Heart size={10} className="flex-shrink-0 fill-red-500 text-red-500" />
                            )}
                            {isSelected && (
                              <span className="flex-shrink-0 text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                                Added
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {city.country} · {city.timezone}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {filtered.length} cities · {selectedIds.length} active clocks
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
