import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'
import PhoneInput from './PhoneInput.jsx'
import { useModalFocusTrap } from '../hooks/useModalFocusTrap.js'

const fieldClass =
  'mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

export default function AddLeadModal({ isOpen, onClose }) {
  const addLead = useLeadStore((s) => s.addLead)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState(undefined)
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)
  const panelRef = useRef(null)
  useModalFocusTrap(isOpen, panelRef)

  const handleClose = useCallback(() => {
    setName('')
    setCompany('')
    setPhone(undefined)
    setNameError('')
    setSaving(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  /** @param {import('react').FormEvent} e */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Name is required')
      return
    }
    setNameError('')
    setSaving(true)
    try {
      await addLead({
        name: trimmed,
        company: company.trim() || undefined,
        phone: phone?.trim() ? phone.trim() : undefined,
      })
      toast.success('Lead added!')
      setName('')
      setCompany('')
      setPhone(undefined)
      setNameError('')
      setSaving(false)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add lead')
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4"
      role="presentation"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        className="max-h-[min(92dvh,720px)] w-full max-w-md animate-fade-in-up overflow-y-auto rounded-t-[var(--radius-modal)] border border-[var(--border-strong)] border-b-0 bg-[var(--bg-surface)] shadow-modal ring-1 ring-white/[0.06] sm:rounded-modal sm:border-b"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[var(--border)] px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--accent)]">
            Create record
          </p>
          <h2 id="add-lead-title" className="font-display pr-10 text-xl font-bold tracking-tight text-[var(--text-primary)]">
            New lead
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Name is required; other fields are optional.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="add-lead-name" className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              id="add-lead-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder="e.g. Jordan Lee"
              className={fieldClass}
            />
            {nameError && <p className="mt-1.5 text-sm text-red-400/95">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="add-lead-company" className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Company <span className="font-normal normal-case tracking-normal text-[var(--text-tertiary)]">(optional)</span>
            </label>
            <input
              id="add-lead-company"
              type="text"
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Northwind Ltd"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="add-lead-phone" className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Phone <span className="font-normal normal-case tracking-normal text-[var(--text-tertiary)]">(optional)</span>
            </label>
            <PhoneInput
              id="add-lead-phone"
              value={phone}
              onChange={setPhone}
              placeholder="555 012 3456"
            />
            <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
              Pick a country code, then enter the local number (stored in international format).
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-[var(--border)] bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0c0d12] shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {saving ? 'Saving…' : 'Save lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
