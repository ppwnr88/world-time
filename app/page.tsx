import type { Metadata } from 'next'
import WorldTimeApp from '../components/WorldTimeApp'

export const metadata: Metadata = {
  title: 'World Time — Current Time Around the World',
  description:
    'Check the current time in 100+ cities worldwide. Live-updating world clock with timezone comparison, analog & digital display, dark mode, and shareable links.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return <WorldTimeApp />
}
