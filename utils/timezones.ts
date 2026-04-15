export interface TimezoneEntry {
  timezone: string   // e.g. "Asia/Bangkok"
  region: string     // e.g. "Asia"
  city: string       // e.g. "Bangkok"
  subzone?: string   // e.g. "Indiana/Indianapolis" → subzone "Indiana/Indianapolis"
}

// Regions we display (skip Etc/, SystemV/, etc.)
const SHOWN_REGIONS = new Set([
  'Africa', 'America', 'Antarctica', 'Asia',
  'Atlantic', 'Australia', 'Europe', 'Indian', 'Pacific',
])

export const REGION_ORDER = [
  'Africa', 'America', 'Antarctica', 'Asia',
  'Atlantic', 'Australia', 'Europe', 'Indian', 'Pacific',
]

// Cached formatters — creating Intl.DateTimeFormat is expensive; reuse per timezone+mode key
const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(timezone: string, showSeconds: boolean): Intl.DateTimeFormat {
  const key = `${timezone}:${showSeconds ? 1 : 0}`
  let fmt = formatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' } : {}),
      hour12: false,
      timeZone: timezone,
    })
    formatterCache.set(key, fmt)
  }
  return fmt
}

export function formatCompactTime(timezone: string, showSeconds: boolean): string {
  try {
    return getFormatter(timezone, showSeconds).format(new Date())
  } catch {
    return '--:--'
  }
}

export function getTimezoneOffsetLabel(timezone: string): string {
  try {
    const now = new Date()
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tz  = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const diffMs = tz.getTime() - utc.getTime()
    const totalMins = Math.round(diffMs / 60000)
    const sign = totalMins >= 0 ? '+' : '-'
    const abs  = Math.abs(totalMins)
    const h    = Math.floor(abs / 60)
    const m    = abs % 60
    return m === 0 ? `GMT${sign}${h}` : `GMT${sign}${h}:${String(m).padStart(2, '0')}`
  } catch {
    return 'GMT+0'
  }
}

/** Returns all IANA timezones the browser supports, filtered & sorted. */
export function getAllTimezones(): TimezoneEntry[] {
  let raw: string[] = []
  try {
    raw = Intl.supportedValuesOf('timeZone')
  } catch {
    // Fallback for environments where supportedValuesOf is unavailable
    raw = []
  }

  return raw
    .filter(tz => SHOWN_REGIONS.has(tz.split('/')[0]))
    .map(tz => {
      const parts = tz.split('/')
      const region = parts[0]
      // For deeply nested zones like America/Indiana/Indianapolis, join inner parts
      const city = parts.slice(1).join('/').replace(/_/g, ' ')
      return { timezone: tz, region, city }
    })
    .sort((a, b) => a.city.localeCompare(b.city))
}

export type GroupedTimezones = Record<string, TimezoneEntry[]>

export function groupTimezones(entries: TimezoneEntry[]): GroupedTimezones {
  const groups: GroupedTimezones = {}
  for (const entry of entries) {
    if (!groups[entry.region]) groups[entry.region] = []
    groups[entry.region].push(entry)
  }
  return groups
}
