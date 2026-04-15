'use client'
import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Search, X, Clock, Timer, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import RegionSection from './RegionSection'
import { getAllTimezones, groupTimezones, REGION_ORDER, type GroupedTimezones } from '../utils/timezones'

interface AllTimezonesViewProps {
  localTimezone: string
}

export default function AllTimezonesView({ localTimezone }: AllTimezonesViewProps) {
  const [query, setQuery]           = useState('')
  const [showSeconds, setShowSeconds] = useState(false)
  const [allOpen, setAllOpen]       = useState(true)
  // Track per-region open state for expand/collapse all
  const openRef = useRef<boolean>(true)

  // Computed once — Intl.supportedValuesOf result is stable
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
    document.getElementById(`region-${region}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleExpandAll = useCallback(() => {
    setAllOpen(true)
    openRef.current = true
  }, [])

  const handleCollapseAll = useCallback(() => {
    setAllOpen(false)
    openRef.current = false
  }, [])

  // Highlight local timezone region nav button
  const localRegion = localTimezone.split('/')[0]

  return (
    <div className="flex flex-col h-full">
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 mb-4 sticky top-0 z-10 bg-slate-50/95 dark:bg-gray-950/95 backdrop-blur-sm pt-1 pb-3">
        {/* Search row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search city, region or timezone…"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl
                bg-white dark:bg-white/5
                border border-gray-200 dark:border-white/10
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500/40
                transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Seconds toggle */}
          <button
            onClick={() => setShowSeconds(s => !s)}
            title={showSeconds ? 'Hide seconds' : 'Show seconds'}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
              border transition-all flex-shrink-0
              ${showSeconds
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
              }
            `}
          >
            {showSeconds ? <Timer size={13} /> : <Clock size={13} />}
            <span className="hidden sm:inline">{showSeconds ? 'HH:mm:ss' : 'HH:mm'}</span>
          </button>

          {/* Expand / collapse all */}
          {!searchActive && (
            allOpen ? (
              <button
                onClick={handleCollapseAll}
                title="Collapse all regions"
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium border
                  bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
                  text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                  transition-colors flex-shrink-0"
              >
                <ChevronsDownUp size={13} />
                <span className="hidden sm:inline">Collapse</span>
              </button>
            ) : (
              <button
                onClick={handleExpandAll}
                title="Expand all regions"
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium border
                  bg-white dark:bg-white/5 border-gray-200 dark:border-white/10
                  text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                  transition-colors flex-shrink-0"
              >
                <ChevronsUpDown size={13} />
                <span className="hidden sm:inline">Expand</span>
              </button>
            )
          )}
        </div>

        {/* Region navigation — sticky quick-jump */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {regionOrder.map(region => (
            <button
              key={region}
              onClick={() => scrollToRegion(region)}
              className={`
                flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full transition-all
                ${region === localRegion
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                }
              `}
            >
              {region}
            </button>
          ))}

          <span className="ml-auto flex-shrink-0 self-center text-xs text-gray-400 dark:text-gray-500 pl-2">
            {total.toLocaleString()} timezone{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="flex items-center gap-2 px-3 mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <span className="flex-1">City / Zone</span>
        <span className="w-[72px] text-right">Offset</span>
        <span className="w-[68px] text-right">Time</span>
      </div>

      {/* ── Region sections ── */}
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
