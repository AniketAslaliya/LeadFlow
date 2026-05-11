/** LocalStorage key for persisted appearance. */
const STORAGE_KEY = 'leadflow-theme'

/** @returns {'light' | 'dark'} */
export function getPreferredTheme() {
  if (typeof window === 'undefined') return 'dark'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  } catch {
    /* ignore */
  }
  return 'dark'
}

/** @param {'light' | 'dark'} mode */
export function applyTheme(mode) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = mode
  document.documentElement.style.colorScheme = mode === 'light' ? 'light' : 'dark'
}

export function initTheme() {
  applyTheme(getPreferredTheme())
}

/** @param {'light' | 'dark'} mode */
export function setTheme(mode) {
  if (mode !== 'light' && mode !== 'dark') return
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
  applyTheme(mode)
  try {
    window.dispatchEvent(new Event('leadflow-theme'))
  } catch {
    /* ignore */
  }
}

/** Subscribe for `useSyncExternalStore` (theme toggle + other-tab storage). */
export function subscribeTheme(callback) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY || e.key == null) callback()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener('leadflow-theme', callback)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('leadflow-theme', callback)
  }
}

/** @returns {'light' | 'dark'} */
export function getTheme() {
  if (typeof document === 'undefined') return 'dark'
  const t = document.documentElement.dataset.theme
  return t === 'light' ? 'light' : 'dark'
}

export function toggleTheme() {
  setTheme(getTheme() === 'light' ? 'dark' : 'light')
}
