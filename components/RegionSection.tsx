'use client'
import { memo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TimezoneEntry } from '../utils/timezones'
import TimezoneRow from './TimezoneRow'

const REGION_EMOJI: Record<string, string> = {
  Africa:     '🌍',
  America:    '🌎',
  Antarctica: '🧊',
  Asia:       '🌏',
  Atlantic:   '🌊',
  Australia:  '🦘',
  Europe:     '🏰',
  Indian:     '🌊',
  Pacific:    '🌺',
}

interface RegionSectionProps {
  region: string
  entries: TimezoneEntry[]
  localTimezone: string
  showSeconds: boolean
  defaultOpen?: boolean
  searchActive: boolean
}

function RegionSection({
  region,
  entries,
  localTimezone,
  showSeconds,
  defaultOpen = true,
  searchActive,
}: RegionSectionProps) {
  // Keep open when search is active so results are visible
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = searchActive ? true : open

  return (
    <section id={`region-${region}`} className="mb-1">
      {/* Region header */}
      <button
        onClick={() => !searchActive && setOpen(o => !o)}
        className={`
          w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left
          bg-gray-100/80 dark:bg-white/5
          hover:bg-gray-200/60 dark:hover:bg-white/10
          transition-colors
          ${searchActive ? 'cursor-default' : 'cursor-pointer'}
        `}
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none">{REGION_EMOJI[region] ?? '🌐'}</span>
        <span className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {region}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
          {entries.length}
        </span>
        {!searchActive && (
          isOpen
            ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
            : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Rows */}
      {isOpen && (
        <div className="mt-0.5 space-y-0.5">
          {entries.map(entry => (
            <TimezoneRow
              key={entry.timezone}
              timezone={entry.timezone}
              city={entry.city}
              isLocal={entry.timezone === localTimezone}
              showSeconds={showSeconds}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default memo(RegionSection)
