'use client'
import { useState, useMemo, useCallback, useRef } from 'react'
import { Search, X, Clock, Timer, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import RegionSection from './RegionSection'
import { getAllTimezones, groupTimezones, REGION_ORDER, type GroupedTimezones } from '../utils/timezones'

interface AllTimezonesViewProps {
  localTimezone: string
}

export default function AllTimezonesView({ localTimezone }: AllTimezonesViewProps) {
  const [query, setQuery]             = useState('')
  const [showSeconds, setShowSeconds] = useState(false)
  const [allOpen, setAllOpen]         = useState(true)

  const localRegion = localTimezone.split('/')[0]
  // Track which region nav button is active (default to local region)
  const [activeRegion, setActiveRegion] = useState<string>(localRegion)

  // Ref to measure toolbar height for accurate scroll offset
  const toolbarRef = useRef<HTMLDivElement>(null)

  const allTimezones = useMemo(() => getAllTimezones(), [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allTimezones
    return allTimezones.filter(e =>
      e.city.toLowerCase().includes(q) ||
      e.region.toLowerCase().includes(q) ||
      e.timezone.toLowerCase().includes(q)
    )
  }, [allTimezones, query])

  const grouped: GroupedTimezones = useMemo(() => groupTimezones(filtered), [filtered])

  const regionOrder = useMemo(
    () => REGION_ORDER.filter(r => grouped[r]?.length > 0),
    [grouped]
  )

  const total = filtered.length
  const searchActive = query.trim().length > 0

  const scrollToRegion = useCallback((region: string) => {
    // Update active button immediately for instant visual feedback
    setActiveRegion(region)

    const el = document.getElementById(`region-${region}`)
    if (!el) return

    // Offset = main sticky header (h-16 = 64px) + this toolbar + 8px breathing room
    const MAIN_HEADER_H = 64
    const toolbarH = toolbarRef.current?.offsetHeight ?? 0
    const offset = MAIN_HEADER_H + toolbarH + 8

    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const handleExpandAll = useCallback(() => setAllOpen(true), [])
  const handleCollapseAll = useCallback(() => setAllOpen(false), [])

  return (
    <div className="flex flex-col h-full">
      {/*
        sticky top-16 = sits directly below the main app header (h-16).
        Without this, the toolbar slides under the header when scrolling.
      */}
      <div
        ref={toolbarRef}
        className="flex flex-col gap-3 mb-4 sticky top-16 z-10 pt-1 pb-3
          bg-gradient-to-b from-slate-50 to-slate-50/95
          dark:bg-none dark:bg-gray-950/95
          backdrop-blur-sm
          border-b border-gray-200/60 dark:border-white/5"
      >
        {/* Search + controls row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                if (!e.target.value) setActiveRegion(localRegion)
              }}
              placeholder="Search city, region or timezone…"
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl
                bg-white dark:bg-white/5
                border border-gray-300/70 dark:border-white/10
                shadow-sm dark:shadow-none
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500/30
                transition-all"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setActiveRegion(localRegion) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-0.5 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* HH:mm / HH:mm:ss toggle */}
          <button
            onClick={() => setShowSeconds(s => !s)}
            title={showSeconds ? 'Hide seconds' : 'Show seconds'}
            className={`
              flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
              border transition-all duration-150 flex-shrink-0 shadow-sm
              ${showSeconds
                ? 'bg-blue-500 border-blue-500 text-white shadow-blue-500/25'
                : 'bg-white dark:bg-white/5 border-gray-300/70 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
              }
            `}
          >
            {showSeconds ? <Timer size={13} /> : <Clock size={13} />}
            <span className="hidden sm:inline">{showSeconds ? 'HH:mm:ss' : 'HH:mm'}</span>
          </button>

          {/* Expand / Collapse all */}
          {!searchActive && (
            allOpen ? (
              <button
                onClick={handleCollapseAll}
                title="Collapse all regions"
                className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl text-xs font-medium
                  border shadow-sm transition-all duration-150 flex-shrink-0
                  bg-white dark:bg-white/5
                  border-gray-300/70 dark:border-white/10
                  text-gray-500 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-white/10"
              >
                <ChevronsDownUp size={13} />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            ) : (
              <button
                onClick={handleExpandAll}
                title="Expand all regions"
                className="flex items-center gap-1 px-2.5 py-2.5 rounded-xl text-xs font-medium
                  border shadow-sm transition-all duration-150 flex-shrink-0
                  bg-white dark:bg-white/5
                  border-gray-300/70 dark:border-white/10
                  text-gray-500 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-white/10"
              >
                <ChevronsUpDown size={13} />
                <span className="hidden sm:inline">Expand</span>
              </button>
            )
          )}
        </div>

        {/* Region quick-jump navigation */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide items-center">
          {regionOrder.map(region => {
            const isActive = region === activeRegion
            return (
              <button
                key={region}
                onClick={() => scrollToRegion(region)}
                className={`
                  flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full
                  transition-all duration-150 active:scale-95
                  ${isActive
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-105'
                    : `bg-white dark:bg-white/5
                       text-gray-500 dark:text-gray-400
                       border border-gray-300/70 dark:border-white/10
                       shadow-sm
                       hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300
                       dark:hover:bg-white/10 dark:hover:text-blue-300 dark:hover:border-blue-400/30`
                  }
                `}
              >
                {region}
              </button>
            )
          })}

          <span className="ml-auto flex-shrink-0 self-center text-xs text-gray-400 dark:text-gray-500 pl-2 whitespace-nowrap">
            {total.toLocaleString()} zone{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <span className="flex-1">City / Zone</span>
        <span className="w-[72px] text-right">Offset</span>
        <span className="w-[68px] text-right">Time</span>
      </div>

      {/* Region sections */}
      {regionOrder.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <Search size={28} className="mb-2 opacity-40" />
          <p className="text-sm">No timezones match &ldquo;{query}&rdquo;</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regionOrder.map(region => (
            <RegionSection
              key={`${region}-${allOpen}`}
              region={region}
              entries={grouped[region]}
              localTimezone={localTimezone}
              showSeconds={showSeconds}
              defaultOpen={allOpen}
              searchActive={searchActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
