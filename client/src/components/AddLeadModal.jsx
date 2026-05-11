import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'

export default function AddLeadModal({ isOpen, onClose }) {
  const addLead = useLeadStore((s) => s.addLead)

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [nameError, setNameError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleClose = useCallback(() => {
    setName('')
    setCompany('')
    setPhone('')
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
        phone: phone.trim() || undefined,
      })
      toast.success('Lead added!')
      setName('')
      setCompany('')
      setPhone('')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-title"
        className="w-full max-w-md animate-fade-in-up rounded-xl bg-[#1A1A1A] shadow-2xl ring-1 ring-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[var(--border)] px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <h2 id="add-lead-title" className="font-display pr-10 text-xl font-bold text-[var(--text-primary)]">
            Add New Lead
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4">
          <label htmlFor="add-lead-name" className="block text-xs font-medium text-[var(--text-tertiary)]">
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
            placeholder="e.g., John Doe"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-[var(--border-focus)] focus:ring-2"
          />
          {nameError && <p className="mt-1 text-sm text-red-400">{nameError}</p>}

          <label htmlFor="add-lead-company" className="mt-4 block text-xs font-medium text-[var(--text-tertiary)]">
            Company <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <input
            id="add-lead-company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Acme Corp"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-[var(--border-focus)] focus:ring-2"
          />

          <label htmlFor="add-lead-phone" className="mt-4 block text-xs font-medium text-[var(--text-tertiary)]">
            Phone <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <input
            id="add-lead-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 555-0123"
            className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-[var(--border-focus)] focus:ring-2"
          />

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-[var(--border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f0f0f] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
