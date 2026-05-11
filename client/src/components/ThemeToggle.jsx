import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import { getTheme, setTheme, subscribeTheme } from '../lib/theme.js'

export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribeTheme, getTheme, () => 'dark')
  const isDark = mode === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={2} aria-hidden /> : <Moon className="h-5 w-5" strokeWidth={2} aria-hidden />}
    </button>
  )
}
