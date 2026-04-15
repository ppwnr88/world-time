import { TimeData } from '../types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export function getTimeInTimezone(timezone: string): TimeData {
  const now = new Date()

  const formatter = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { ...options, timeZone: timezone })

  const hoursPart = formatter({ hour: '2-digit', hour12: false }).format(now)
  const minutesPart = formatter({ minute: '2-digit' }).format(now)
  const secondsPart = formatter({ second: '2-digit' }).format(now)
  const hour12Part = formatter({ hour: 'numeric', hour12: true }).format(now)

  const hours = hoursPart.padStart(2, '0')
  const minutes = minutesPart.padStart(2, '0')
  const seconds = secondsPart.padStart(2, '0')

  // Get date parts
  const dateParts = formatter({
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).formatToParts(now)

  const dayOfWeek = dateParts.find(p => p.type === 'weekday')?.value ?? ''
  const month = dateParts.find(p => p.type === 'month')?.value ?? ''
  const day = dateParts.find(p => p.type === 'day')?.value ?? ''
  const year = dateParts.find(p => p.type === 'year')?.value ?? ''

  const date = `${dayOfWeek}, ${month} ${day}, ${year}`

  // Get timezone offset
  const offset = getTimezoneOffset(timezone, now)
  const isPM = parseInt(hours) >= 12

  return {
    hours,
    minutes,
    seconds,
    date,
    dayOfWeek,
    offset,
    timestamp: now.getTime(),
    isPM,
  }
}

export function getTimezoneOffset(timezone: string, date: Date = new Date()): string {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const diffMs = tzDate.getTime() - utcDate.getTime()
    const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60))
    const diffMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60))
    const sign = diffMs >= 0 ? '+' : '-'

    if (diffMinutes === 0) {
      return `GMT${sign}${diffHours}`
    }
    return `GMT${sign}${diffHours}:${String(diffMinutes).padStart(2, '0')}`
  } catch {
    return 'GMT+0'
  }
}

export function getTimeDifference(timezone1: string, timezone2: string): string {
  const now = new Date()
  try {
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tz1Date = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }))
    const tz2Date = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }))

    const tz1Offset = tz1Date.getTime() - utc.getTime()
    const tz2Offset = tz2Date.getTime() - utc.getTime()
    const diffMs = tz2Offset - tz1Offset
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours === 0) return 'Same time'
    const sign = diffHours > 0 ? '+' : ''
    return `${sign}${diffHours}h`
  } catch {
    return ''
  }
}

export function formatTime12h(hours: string, minutes: string, seconds: string): {
  time: string
  period: string
} {
  const h = parseInt(hours)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return {
    time: `${String(h12).padStart(2, '0')}:${minutes}:${seconds}`,
    period,
  }
}

export function copyTimeToClipboard(timeData: TimeData, cityName: string): boolean {
  const text = `${cityName}: ${timeData.hours}:${timeData.minutes}:${timeData.seconds} - ${timeData.date} (${timeData.offset})`
  try {
    navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
