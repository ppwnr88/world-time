/**
 * Global singleton timer — ONE setInterval shared across all subscribers.
 * Subscribers receive a tick callback; they update the DOM directly (no React state).
 */

type Callback = () => void

class GlobalTimerManager {
  private callbacks = new Set<Callback>()
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null

  subscribe(cb: Callback): () => void {
    this.callbacks.add(cb)
    if (this.callbacks.size === 1) this.start()
    return () => {
      this.callbacks.delete(cb)
      if (this.callbacks.size === 0) this.stop()
    }
  }

  private start() {
    // Align to the next second boundary so all ticks fire on :00ms
    const msToNext = 1000 - (Date.now() % 1000)
    this.timeoutId = setTimeout(() => {
      this.flush()
      this.intervalId = setInterval(() => this.flush(), 1000)
    }, msToNext)
  }

  private flush() {
    this.callbacks.forEach(cb => cb())
  }

  private stop() {
    if (this.timeoutId) { clearTimeout(this.timeoutId); this.timeoutId = null }
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null }
  }
}

// Module-level singleton — survives component re-mounts
export const globalTimer = new GlobalTimerManager()
