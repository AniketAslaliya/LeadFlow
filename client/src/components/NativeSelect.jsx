import { ChevronDown } from 'lucide-react'

/** Native `<select>` styling — use inside `NativeSelect` wrapper (adds chevron). */
export const NATIVE_SELECT_CLASS =
  'w-full cursor-pointer appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-2.5 pl-3 pr-10 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

/**
 * @param {{ id?: string; className?: string; children: import('react').ReactNode } & import('react').SelectHTMLAttributes<HTMLSelectElement>} props
 */
export default function NativeSelect({ id, className = '', children, ...rest }) {
  return (
    <div className={`relative ${className}`.trim()}>
      <select id={id} className={NATIVE_SELECT_CLASS} {...rest}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  )
}
