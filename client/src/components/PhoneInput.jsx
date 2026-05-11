import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  combinePhone,
  parseStoredPhone,
  findDialRow,
  filterDialCodes,
} from '../utils/phoneUtils.js'

const triggerClass =
  'flex w-full max-w-[min(52vw,13rem)] sm:max-w-[13rem] cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-2.5 pl-3 pr-3 text-left text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

const searchInputClass =
  'w-full max-w-[min(52vw,13rem)] sm:max-w-[13rem] rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

const nationalInputClass =
  'min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

/**
 * Searchable country / dial code picker + national number.
 *
 * @param {{
 *   id?: string
 *   value: string | null | undefined
 *   onChange: (next: string | undefined) => void
 *   disabled?: boolean
 *   placeholder?: string
 *   'aria-invalid'?: boolean
 * }} props
 */
export default function PhoneInput({
  id: idProp,
  value,
  onChange,
  disabled,
  placeholder = '555 012 3456',
  'aria-invalid': ariaInvalid,
}) {
  const reactId = useId()
  const baseId = idProp ?? reactId
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  /** Sync with keyboard highlight — state can lag Enter after Arrow keys in the same frame. */
  const highlightedRef = useRef(0)

  const parsed = parseStoredPhone(value)
  const currentRow = findDialRow(parsed.dial)
  const dial = currentRow.dial
  const nationalDigits = parsed.nationalDigits

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)

  const filtered = open ? filterDialCodes(query) : []

  useEffect(() => {
    if (!open || !query.trim()) return
    const f = filterDialCodes(query)
    if (f.length !== 1) return
    const row = f[0]
    const t = setTimeout(() => {
      const again = filterDialCodes(query)
      if (again.length === 1 && again[0].dial === row.dial) {
        onChange(combinePhone(row.dial, nationalDigits))
        setOpen(false)
        setQuery('')
      }
    }, 420)
    return () => clearTimeout(t)
  }, [query, open, nationalDigits, onChange])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const pick = (row) => {
    onChange(combinePhone(row.dial, nationalDigits))
    setOpen(false)
    setQuery('')
  }

  const domIdForDial = (dialCode) =>
    `${baseId}-opt-${dialCode.replace(/^\+/, '')}`

  const onSearchKeyDown = (e) => {
    const isEnter = e.key === 'Enter' || e.key === 'NumpadEnter'
    if (e.key === 'Escape') {
      e.stopPropagation()
      setOpen(false)
      setQuery('')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filtered.length === 0) return
      setHighlighted((i) => {
        const next = Math.min(i + 1, filtered.length - 1)
        highlightedRef.current = next
        return next
      })
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filtered.length === 0) return
      setHighlighted((i) => {
        const next = Math.max(0, i - 1)
        highlightedRef.current = next
        return next
      })
    }
    if (isEnter) {
      if (filtered.length === 0) return
      e.preventDefault()
      e.stopPropagation()
      const idx = Math.min(highlightedRef.current, filtered.length - 1)
      const row = filtered[idx]
      if (row) pick(row)
    }
  }

  const activeDescendantId =
    open && filtered.length > 0
      ? domIdForDial(filtered[Math.min(highlighted, filtered.length - 1)].dial)
      : undefined

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
      <div ref={containerRef} className="relative flex min-w-0 shrink-0 flex-col gap-1">
        <label htmlFor={`${baseId}-dial`} className="sr-only">
          Country calling code
        </label>
        {!open ? (
          <button
            id={`${baseId}-dial`}
            type="button"
            disabled={disabled}
            aria-label="Country calling code"
            aria-expanded="false"
            aria-haspopup="listbox"
            className={triggerClass}
            onClick={() => {
              if (disabled) return
              highlightedRef.current = 0
              setHighlighted(0)
              setOpen(true)
            }}
          >
            <span className="min-w-0 truncate font-mono text-[0.8125rem]">
              {currentRow.dial} · {currentRow.label}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" strokeWidth={2} aria-hidden />
          </button>
        ) : (
          <>
            <input
              ref={searchRef}
              id={`${baseId}-dial`}
              type="text"
              autoComplete="off"
              aria-expanded="true"
              aria-controls={`${baseId}-dial-list`}
              aria-activedescendant={activeDescendantId}
              aria-autocomplete="list"
              role="combobox"
              disabled={disabled}
              placeholder="Type country name or code…"
              className={searchInputClass}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                highlightedRef.current = 0
                setHighlighted(0)
              }}
              onKeyDown={onSearchKeyDown}
            />
            <ul
              id={`${baseId}-dial-list`}
              role="listbox"
              aria-label="Country calling codes"
              className="absolute left-0 right-0 z-[100] mt-1 max-h-56 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] py-1 shadow-lg ring-1 ring-[color:var(--ring-faint)]"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--text-tertiary)]">No matches</li>
              ) : (
                filtered.map((row, i) => {
                  const isActive = i === Math.min(highlighted, filtered.length - 1)
                  return (
                    <li key={row.dial} role="none">
                      <button
                        type="button"
                        id={domIdForDial(row.dial)}
                        role="option"
                        aria-selected={isActive}
                        className={`flex w-full px-3 py-2 text-left font-mono text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-input)] ${
                          isActive ? 'bg-[var(--bg-input)]' : ''
                        }`}
                        onMouseEnter={() => {
                          highlightedRef.current = i
                          setHighlighted(i)
                        }}
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => pick(row)}
                      >
                        {row.dial} · {row.label}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={`${baseId}-tel`} className="sr-only">
          Phone number without country code
        </label>
        <input
          id={`${baseId}-tel`}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          className={`${nationalInputClass} w-full`}
          value={nationalDigits}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '')
            onChange(combinePhone(dial, raw))
          }}
        />
      </div>
    </div>
  )
}
