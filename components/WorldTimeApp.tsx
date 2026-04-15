'use client'
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Heart, Clock as ClockIcon } from 'lucide-react'
import Header from './Header'
import ClockCard from './ClockCard'
import CitySelector from './CitySelector'
import AdSlot from './AdSlot'
import { CITIES, getLocalCity } from '../utils/cities'
import { useFavorites } from '../hooks/useFavorites'
import { useTheme } from '../hooks/useTheme'
import { ActiveClock } from '../types'

function WorldTimeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggle: toggleTheme } = useTheme()
  const { favorites, toggleFavorite, isFavorite } = useFavorites()
  const [activeClocks, setActiveClocks] = useState<ActiveClock[]>([])
  const [showSelector, setShowSelector] = useState(false)
  const [localTimezone, setLocalTimezone] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Initialize on mount (client-side only)
  useEffect(() => {
    setMounted(true)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setLocalTimezone(tz)

    const urlCities = searchParams.get('cities')
    if (urlCities) {
      const cityIds = urlCities.split(',').filter(Boolean)
      const resolved = cityIds
        .map(id => CITIES.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c != null)
        .map(city => ({
          ...city,
          isFavorite: isFavorite(city.id),
          showAnalog: false,
        }))
      if (resolved.length > 0) {
        setActiveClocks(resolved)
        return
      }
    }

    // Default: local city + popular cities
    const local = getLocalCity()
    const defaults = [local.id, 'london', 'new-york', 'tokyo']
    const initial = defaults
      .map(id => id === local.id ? local : CITIES.find(c => c.id === id))
      .filter((c): c is NonNullable<typeof c> => c != null)
      // Deduplicate by timezone+id
      .filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i)
      .map(city => ({
        ...city,
        isFavorite: isFavorite(city.id),
        showAnalog: false,
      }))
    setActiveClocks(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL when clocks change
  useEffect(() => {
    if (!mounted || activeClocks.length === 0) return
    const cityIds = activeClocks.map(c => c.id).join(',')
    const params = new URLSearchParams({ cities: cityIds })
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [activeClocks, mounted, router])

  const addCity = useCallback((cityId: string) => {
    const city = CITIES.find(c => c.id === cityId)
    if (!city || activeClocks.some(c => c.id === cityId)) return
    setActiveClocks(prev => [...prev, {
      ...city,
      isFavorite: isFavorite(city.id),
      showAnalog: false,
    }])
    setShowSelector(false)
  }, [activeClocks, isFavorite])

  const removeCity = useCallback((cityId: string) => {
    setActiveClocks(prev => prev.filter(c => c.id !== cityId))
  }, [])

  const handleToggleFavorite = useCallback((cityId: string) => {
    toggleFavorite(cityId)
    setActiveClocks(prev => prev.map(c =>
      c.id === cityId ? { ...c, isFavorite: !c.isFavorite } : c
    ))
  }, [toggleFavorite])

  const handleToggleAnalog = useCallback((cityId: string) => {
    setActiveClocks(prev => prev.map(c =>
      c.id === cityId ? { ...c, showAnalog: !c.showAnalog } : c
    ))
  }, [])

  const favoritesCount = useMemo(() => activeClocks.filter(c => c.isFavorite).length, [activeClocks])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading clocks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30">
      <Header
        theme={theme}
        onThemeToggle={toggleTheme}
        onAddCity={() => setShowSelector(true)}
        activeCount={activeClocks.length}
      />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        {/* Ad slot below header */}
        <div className="mb-6 rounded-xl overflow-hidden">
          <AdSlot slot="2345678901" format="horizontal" />
        </div>

        {/* Stats bar */}
        {activeClocks.length > 0 && (
          <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <ClockIcon size={14} />
              {activeClocks.length} clock{activeClocks.length !== 1 ? 's' : ''}
            </span>
            {favoritesCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Heart size={14} className="fill-red-500 text-red-500" />
                {favoritesCount} favorite{favoritesCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Clock grid */}
        {activeClocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <ClockIcon size={28} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No clocks yet</h2>
            <p className="text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
              Add cities to start tracking time around the world
            </p>
            <button
              onClick={() => setShowSelector(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
            >
              Add your first city
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeClocks.map((clock, index) => (
              <div key={clock.id}>
                <ClockCard
                  clock={clock}
                  localTimezone={localTimezone}
                  onRemove={removeCity}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleAnalog={handleToggleAnalog}
                />
                {/* Ad every 8 clocks */}
                {(index + 1) % 8 === 0 && index < activeClocks.length - 1 && (
                  <div className="col-span-full mt-4">
                    <AdSlot slot="3456789012" format="horizontal" />
                  </div>
                )}
              </div>
            ))}

            {/* Add city card */}
            <button
              onClick={() => setShowSelector(true)}
              className="
                min-h-[180px] rounded-2xl flex flex-col items-center justify-center gap-3
                border-2 border-dashed border-gray-200 dark:border-white/10
                text-gray-400 dark:text-gray-600
                hover:border-blue-400 dark:hover:border-blue-500/50
                hover:text-blue-500 dark:hover:text-blue-400
                hover:bg-blue-50/50 dark:hover:bg-blue-500/5
                transition-all duration-200 group
              "
            >
              <div className="w-10 h-10 rounded-xl border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl leading-none font-light">+</span>
              </div>
              <span className="text-sm font-medium">Add City</span>
            </button>
          </div>
        )}

        {/* Bottom ad */}
        {activeClocks.length > 0 && (
          <div className="mt-8 rounded-xl overflow-hidden">
            <AdSlot slot="4567890123" format="auto" />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-black/5 dark:border-white/5 text-center text-xs text-gray-400 dark:text-gray-500">
        <p>World Time &mdash; Current time around the globe</p>
        <p className="mt-1">Times update live every second</p>
      </footer>

      {/* City selector modal */}
      {showSelector && (
        <CitySelector
          onSelect={addCity}
          onClose={() => setShowSelector(false)}
          selectedIds={activeClocks.map(c => c.id)}
          favorites={favorites}
        />
      )}
    </div>
  )
}

export default function WorldTimeApp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    }>
      <WorldTimeContent />
    </Suspense>
  )
}
