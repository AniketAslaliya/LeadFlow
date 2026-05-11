import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusable(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (el) => el instanceof HTMLElement && !el.hasAttribute('disabled'),
  )
}

/**
 * Trap focus inside `containerRef` when `active`, restore focus on cleanup.
 * @param {boolean} active
 * @param {React.RefObject<HTMLElement | null>} containerRef
 */
export function useModalFocusTrap(active, containerRef) {
  const previousActiveRef = useRef(/** @type {Element | null} */ (null))

  useEffect(() => {
    if (!active || !containerRef.current) return undefined

    const container = containerRef.current
    previousActiveRef.current = document.activeElement

    const list = getFocusable(container)
    const first = list[0]
    queueMicrotask(() => first?.focus({ preventScroll: true }))

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const els = getFocusable(container)
      if (els.length === 0) return
      const firstEl = els[0]
      const lastEl = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus({ preventScroll: true })
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus({ preventScroll: true })
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const prev = previousActiveRef.current
      if (prev instanceof HTMLElement) {
        prev.focus({ preventScroll: true })
      }
    }
  }, [active, containerRef])
}
