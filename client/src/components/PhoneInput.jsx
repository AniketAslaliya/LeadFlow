import { useId } from 'react'
import {
  DIAL_CODES,
  DEFAULT_DIAL,
  combinePhone,
  parseStoredPhone,
} from '../utils/phoneUtils.js'

const selectClass =
  'shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-2.5 pl-3 pr-8 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow max-w-[min(52vw,13rem)] sm:max-w-[13rem]'

const inputClass =
  'min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

function dialIsListed(d) {
  return DIAL_CODES.some((row) => row.dial === d)
}

/**
 * Country dial + local number; value stored as compact international string (e.g. +15551234567).
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
  const parsed = parseStoredPhone(value)
  const dial = dialIsListed(parsed.dial) ? parsed.dial : DEFAULT_DIAL
  const nationalDigits = parsed.nationalDigits

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
      <div className="flex shrink-0 flex-col gap-1">
        <label htmlFor={`${baseId}-dial`} className="sr-only">
          Country calling code
        </label>
        <select
          id={`${baseId}-dial`}
          value={dial}
          disabled={disabled}
          aria-label="Country calling code"
          className={selectClass}
          onChange={(e) => {
            const next = e.target.value || DEFAULT_DIAL
            onChange(combinePhone(next, nationalDigits))
          }}
        >
          {DIAL_CODES.map((row) => (
            <option key={row.dial} value={row.dial}>
              {row.dial} · {row.label}
            </option>
          ))}
        </select>
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
          className={`${inputClass} w-full`}
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
