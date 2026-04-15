'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { TimeData } from '../types'
import { getTimeInTimezone } from '../utils/time'

export function useClock(timezone: string): TimeData {
  const [timeData, setTimeData] = useState<TimeData>(() => getTimeInTimezone(timezone))
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const tick = useCallback(() => {
    setTimeData(getTimeInTimezone(timezone))
  }, [timezone])

  useEffect(() => {
    tick()
    // Sync to the next second boundary for accurate ticking
    const now = Date.now()
    const msToNextSecond = 1000 - (now % 1000)

    const timeout = setTimeout(() => {
      tick()
      intervalRef.current = setInterval(tick, 1000)
    }, msToNextSecond)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tick])

  return timeData
}

export function useMultiClock(timezones: string[]): Record<string, TimeData> {
  const [clocks, setClocks] = useState<Record<string, TimeData>>(() => {
    const initial: Record<string, TimeData> = {}
    timezones.forEach(tz => { initial[tz] = getTimeInTimezone(tz) })
    return initial
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const tick = () => {
      const updated: Record<string, TimeData> = {}
      timezones.forEach(tz => { updated[tz] = getTimeInTimezone(tz) })
      setClocks(updated)
    }

    const now = Date.now()
    const msToNextSecond = 1000 - (now % 1000)
    let timeout: NodeJS.Timeout

    timeout = setTimeout(() => {
      tick()
      intervalRef.current = setInterval(tick, 1000)
    }, msToNextSecond)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timezones.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  return clocks
}
