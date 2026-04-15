'use client'
import { useMemo } from 'react'
import { TimeData } from '../types'

interface AnalogClockProps {
  timeData: TimeData
  size?: number
}

export default function AnalogClock({ timeData, size = 140 }: AnalogClockProps) {
  const { hours, minutes, seconds } = timeData

  const angles = useMemo(() => {
    const h = parseInt(hours) % 12
    const m = parseInt(minutes)
    const s = parseInt(seconds)

    return {
      second: s * 6,
      minute: m * 6 + s * 0.1,
      hour: h * 30 + m * 0.5,
    }
  }, [hours, minutes, seconds])

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4

  const handEnd = (angle: number, length: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + length * Math.cos(rad),
      y: cy + length * Math.sin(rad),
    }
  }

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30
    const rad = ((angle - 90) * Math.PI) / 180
    const inner = r - 8
    const outer = r - 2
    return {
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
    }
  })

  const minuteMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null
    const angle = i * 6
    const rad = ((angle - 90) * Math.PI) / 180
    const inner = r - 4
    const outer = r - 1
    return {
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
    }
  }).filter(Boolean)

  const secondEnd = handEnd(angles.second, r * 0.82)
  const minuteEnd = handEnd(angles.minute, r * 0.7)
  const hourEnd = handEnd(angles.hour, r * 0.5)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-sm"
      aria-label={`Analog clock showing ${hours}:${minutes}:${seconds}`}
    >
      {/* Clock face */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className="fill-white/10 dark:fill-white/5 stroke-white/30 dark:stroke-white/20"
        strokeWidth="1.5"
      />

      {/* Minute markers */}
      {minuteMarkers.map((m, i) => m && (
        <line
          key={`min-${i}`}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          className="stroke-white/30 dark:stroke-white/20"
          strokeWidth="1"
          strokeLinecap="round"
        />
      ))}

      {/* Hour markers */}
      {hourMarkers.map((m, i) => (
        <line
          key={`hour-${i}`}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          className="stroke-white/70 dark:stroke-white/50"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={hourEnd.x}
        y2={hourEnd.y}
        className="stroke-gray-800 dark:stroke-white"
        strokeWidth="3.5"
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={minuteEnd.x}
        y2={minuteEnd.y}
        className="stroke-gray-700 dark:stroke-gray-200"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: 'all 0.3s ease' }}
      />

      {/* Second hand */}
      <line
        x1={cx}
        y1={cy}
        x2={secondEnd.x}
        y2={secondEnd.y}
        className="stroke-red-500"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle
        cx={cx}
        cy={cy}
        r="3.5"
        className="fill-red-500"
      />
      <circle
        cx={cx}
        cy={cy}
        r="1.5"
        className="fill-white"
      />
    </svg>
  )
}
