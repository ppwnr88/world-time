'use client'
import { memo, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { globalTimer } from '../hooks/useSharedTimer'
import { formatCompactTime, getTimezoneOffsetLabel } from '../utils/timezones'

interface TimezoneRowProps {
  timezone: string
  city: string
  isLocal: boolean
  showSeconds: boolean
}

function TimezoneRow({ timezone, city, isLocal, showSeconds }: TimezoneRowProps) {
  const timeRef   = useRef<HTMLSpanElement>(null)
  const offsetRef = useRef<HTMLSpanElement>(null)

  // Compute offset label once per mount (DST transitions are imperceptible in UX terms)
  const initialOffset = getTimezoneOffsetLabel(timezone)

  useEffect(() => {
    // Initial paint before the first timer tick
    if (timeRef.current)   timeRef.current.textContent   = formatCompactTime(timezone, showSeconds)
    if (offsetRef.current) offsetRef.current.textContent = getTimezoneOffsetLabel(timezone)

    // Subscribe to the global singleton — zero extra intervals
    const unsub = globalTimer.subscribe(() => {
      if (timeRef.current)   timeRef.current.textContent   = formatCompactTime(timezone, showSeconds)
      if (offsetRef.current) offsetRef.current.textContent = getTimezoneOffsetLabel(timezone)
    })
    return unsub
  }, [timezone, showSeconds])

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
        ${isLocal
          ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20'
          : 'hover:bg-gray-50 dark:hover:bg-white/5'
        }
      `}
    >
      {/* City */}
      <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate min-w-0 flex items-center gap-1.5">
        {isLocal && <MapPin size={11} className="flex-shrink-0 text-blue-500" />}
        {city}
      </span>

      {/* Offset — updated via DOM ref */}
      <span
        ref={offsetRef}
        className="text-xs text-gray-400 dark:text-gray-500 w-[72px] text-right flex-shrink-0 tabular-nums"
      >
        {initialOffset}
      </span>

      {/* Time — updated via DOM ref (NO React re-render on tick) */}
      <span
        ref={timeRef}
        className="font-mono text-sm font-medium text-gray-700 dark:text-gray-200 w-[68px] text-right flex-shrink-0 tabular-nums"
      />
    </div>
  )
}

// memo: only re-render when props change (never on parent timer state)
export default memo(TimezoneRow)
