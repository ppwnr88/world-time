'use client'
import { useState, useCallback, memo } from 'react'
import { Heart, X, Copy, Check, Clock, Timer } from 'lucide-react'
import { ActiveClock, TimeData } from '../types'
import { useClock } from '../hooks/useClock'
import { copyTimeToClipboard, getTimeDifference } from '../utils/time'
import AnalogClock from './AnalogClock'

interface ClockCardProps {
  clock: ActiveClock
  localTimezone?: string
  onRemove: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleAnalog: (id: string) => void
}

function ClockCard({ clock, localTimezone, onRemove, onToggleFavorite, onToggleAnalog }: ClockCardProps) {
  const timeData = useClock(clock.timezone)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    copyTimeToClipboard(timeData, clock.name)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [timeData, clock.name])

  const timeDiff = localTimezone && localTimezone !== clock.timezone
    ? getTimeDifference(localTimezone, clock.timezone)
    : null

  const { hours, minutes, seconds, date, offset, isPM } = timeData
  const h12 = parseInt(hours) % 12 || 12
  const displayHours = String(h12).padStart(2, '0')

  const isNight = parseInt(hours) >= 20 || parseInt(hours) < 6

  return (
    <div
      className={`
        relative group rounded-2xl p-5 flex flex-col gap-3
        bg-white/70 dark:bg-white/5
        backdrop-blur-md
        border border-white/60 dark:border-white/10
        shadow-lg dark:shadow-black/20
        hover:shadow-xl dark:hover:shadow-black/30
        hover:border-white/80 dark:hover:border-white/20
        transition-all duration-300 hover:-translate-y-0.5
        animate-slide-up
      `}
    >
      {/* Top bar */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0">{clock.flag}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white truncate leading-tight">
              {clock.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{clock.country}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onToggleFavorite(clock.id)}
            aria-label={clock.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <Heart
              size={14}
              className={clock.isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 dark:text-gray-500'}
            />
          </button>
          <button
            onClick={handleCopy}
            aria-label="Copy time"
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {copied
              ? <Check size={14} className="text-green-500" />
              : <Copy size={14} className="text-gray-400 dark:text-gray-500" />
            }
          </button>
          <button
            onClick={() => onToggleAnalog(clock.id)}
            aria-label="Toggle analog clock"
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {clock.showAnalog
              ? <Timer size={14} className="text-blue-500" />
              : <Clock size={14} className="text-gray-400 dark:text-gray-500" />
            }
          </button>
          <button
            onClick={() => onRemove(clock.id)}
            aria-label="Remove clock"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <X size={14} className="text-gray-400 dark:text-gray-500 hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Clock display */}
      {clock.showAnalog ? (
        <div className="flex justify-center py-2">
          <AnalogClock timeData={timeData} size={140} />
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className={`
            text-5xl font-bold tracking-tight tabular-nums
            ${isNight
              ? 'text-indigo-900 dark:text-indigo-200'
              : 'text-gray-900 dark:text-white'
            }
          `}>
            {displayHours}:{minutes}
          </span>
          <span className="text-2xl font-semibold tabular-nums text-gray-500 dark:text-gray-400">
            :{seconds}
          </span>
          <span className="text-lg font-medium text-gray-400 dark:text-gray-500 ml-1 self-end pb-1">
            {isPM ? 'PM' : 'AM'}
          </span>
        </div>
      )}

      {/* Bottom info */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-tight">
            {date.split(',').slice(0, 2).join(',')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{offset}</p>
        </div>

        {timeDiff && (
          <span className={`
            text-xs font-semibold px-2 py-0.5 rounded-full
            ${timeDiff.startsWith('+')
              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
              : timeDiff.startsWith('-')
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'
            }
          `}>
            {timeDiff}
          </span>
        )}

        {isNight && (
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">🌙 Night</span>
        )}
      </div>
    </div>
  )
}

export default memo(ClockCard)
