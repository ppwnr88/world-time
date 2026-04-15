export interface City {
  id: string
  name: string
  country: string
  timezone: string
  flag: string
  region: string
}

export interface ActiveClock extends City {
  isFavorite: boolean
  showAnalog: boolean
}

export interface TimeData {
  hours: string
  minutes: string
  seconds: string
  date: string
  dayOfWeek: string
  offset: string
  timestamp: number
  isPM: boolean
}

export type ThemeMode = 'light' | 'dark'

export type ClockView = 'digital' | 'analog'
