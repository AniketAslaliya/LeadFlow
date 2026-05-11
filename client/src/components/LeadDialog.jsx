import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { X, Loader2, UserCircle } from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'
import DiscussionItem from './DiscussionItem.jsx'
import AddDiscussionForm from './AddDiscussionForm.jsx'
import PhoneInput from './PhoneInput.jsx'
import { formatPhoneDisplay, telHref } from '../utils/phoneUtils.js'
import { useModalFocusTrap } from '../hooks/useModalFocusTrap.js'

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'ProposalSent', label: 'Proposal Sent' },
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
]

const fieldClass =
  'mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

/**
 * @param {{ lead: { id: string; name: string; company?: string | null; phone?: string | null }; updateLead: (id: string, patch: object) => Promise<unknown> }} props
 */
function LeadContactSection({ lead, updateLead }) {
  const [cName, setCName] = useState(lead.name)
  const [cCompany, setCCompany] = useState(lead.company ?? '')
  const [cPhone, setCPhone] = useState(lead.phone ?? undefined)
  const [savingContact, setSavingContact] = useState(false)

  const contactDirty =
    cName.trim() !== lead.name.trim() ||
    cCompany.trim() !== (lead.company ?? '').trim() ||
    (cPhone?.trim() || '') !== (lead.phone ?? '').trim()

  const saveContact = async () => {
    const name = cName.trim()
    if (!name) {
      toast.error('Name is required')
      return
    }
    setSavingContact(true)
    try {
      await updateLead(lead.id, {
        name,
        company: cCompany.trim() || null,
        phone: cPhone?.trim() ? cPhone.trim() : null,
      })
      toast.success('Contact updated')
    } catch {
      toast.error('Could not save contact')
    } finally {
      setSavingContact(false)
    }
  }

  const nameId = `dlg-name-${lead.id}`
  const companyId = `dlg-company-${lead.id}`

  return (
    <details className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 px-4 py-3 sm:mt-6">
      <summary className="cursor-pointer list-none font-display text-sm font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-[var(--accent)]" strokeWidth={2} aria-hidden />
          Edit contact
        </span>
      </summary>
      <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
        <div>
          <label htmlFor={nameId} className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Full name
          </label>
          <input
            id={nameId}
            type="text"
            autoComplete="name"
            value={cName}
            onChange={(e) => setCName(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={companyId} className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Company
          </label>
          <input
            id={companyId}
            type="text"
            autoComplete="organization"
            value={cCompany}
            onChange={(e) => setCCompany(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Phone</span>
          <PhoneInput id={`dlg-phone-${lead.id}`} value={cPhone} onChange={setCPhone} placeholder="Local number" />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={!contactDirty || savingContact}
            onClick={saveContact}
            className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0c0d12] shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingContact ? 'Saving…' : 'Save contact'}
          </button>
        </div>
      </div>
    </details>
  )
}

export default function LeadDialog() {
  const selectedLeadId = useLeadStore((s) => s.selectedLeadId)
  const leads = useLeadStore((s) => s.leads)
  const discussionsByLead = useLeadStore((s) => s.discussions)
  const fetchDiscussions = useLeadStore((s) => s.fetchDiscussions)
  const updateLead = useLeadStore((s) => s.updateLead)
  const selectLead = useLeadStore((s) => s.selectLead)

  const [discussionsLoading, setDiscussionsLoading] = useState(false)

  const lead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  )

  const discussions = selectedLeadId ? discussionsByLead[selectedLeadId] : undefined

  const panelRef = useRef(null)
  useModalFocusTrap(Boolean(selectedLeadId && lead), panelRef)

  useEffect(() => {
    if (selectedLeadId && !leads.some((l) => l.id === selectedLeadId)) {
      queueMicrotask(() => selectLead(null))
    }
  }, [selectedLeadId, leads, selectLead])

  useEffect(() => {
    if (!selectedLeadId) return undefined
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setDiscussionsLoading(true)
    })
    ;(async () => {
      try {
        await fetchDiscussions(selectedLeadId, { force: true })
      } finally {
        if (!cancelled) {
          queueMicrotask(() => setDiscussionsLoading(false))
        }
      }
    })()
    return () => {
      cancelled = true
      queueMicrotask(() => setDiscussionsLoading(false))
    }
  }, [selectedLeadId, fetchDiscussions])

  useEffect(() => {
    if (!selectedLeadId) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') selectLead(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedLeadId, selectLead])

  if (!selectedLeadId || !lead) {
    return null
  }

  const close = () => selectLead(null)

  const handleStatusChange = async (e) => {
    const status = e.target.value
    try {
      await updateLead(lead.id, { status })
    } catch {
      toast.error('Could not update status')
    }
  }

  const phoneDisplay = formatPhoneDisplay(lead.phone)
  const phoneLink = telHref(lead.phone)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-4"
      role="presentation"
      onClick={close}
    >
      <div
        ref={panelRef}
        key={selectedLeadId}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-dialog-title"
        className="flex max-h-[min(90dvh,880px)] w-full max-w-[600px] animate-fade-in-up flex-col rounded-t-[var(--radius-modal)] border border-[var(--border-strong)] border-b-0 bg-[var(--bg-surface)] shadow-modal ring-1 ring-white/[0.06] sm:max-h-[min(92dvh,880px)] sm:rounded-modal sm:border-b"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 border-b border-[var(--border)] bg-[var(--bg-surface)] p-5 pb-4 sm:p-6 sm:pb-5">
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] sm:right-4 sm:top-4"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <h2 id="lead-dialog-title" className="font-display pr-11 text-xl font-bold tracking-tight text-[var(--text-primary)] sm:pr-12 sm:text-2xl">
            {lead.name}
          </h2>
          {(lead.company || phoneDisplay) && (
            <p className="mt-2 font-mono text-xs leading-snug text-[var(--text-secondary)] sm:text-sm">
              {lead.company && <span>{lead.company}</span>}
              {lead.company && phoneDisplay && <span className="text-[var(--text-tertiary)]"> · </span>}
              {phoneDisplay &&
                (phoneLink ? (
                  <a href={phoneLink} className="text-[var(--accent)] underline-offset-2 hover:underline">
                    {phoneDisplay}
                  </a>
                ) : (
                  <span>{phoneDisplay}</span>
                ))}
            </p>
          )}
          <label htmlFor="lead-status" className="mt-4 block text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] sm:mt-5">
            Status
          </label>
          <select
            id="lead-status"
            value={lead.status}
            onChange={handleStatusChange}
            className="mt-2 w-full max-w-xs rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <LeadContactSection key={lead.id} lead={lead} updateLead={updateLead} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {discussionsLoading && discussions === undefined ? (
            <div className="flex justify-center py-14 text-[var(--accent)]">
              <Loader2 className="h-9 w-9 animate-spin" strokeWidth={2.25} />
            </div>
          ) : (discussions?.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm leading-relaxed text-[var(--text-tertiary)]">
              No discussions yet. Add the first note below.
            </p>
          ) : (
            <div className="pr-1">
              {discussions.map((d) => (
                <DiscussionItem key={d.id} discussion={d} />
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 sm:px-6 sm:py-5">
          <AddDiscussionForm leadId={selectedLeadId} onSaved={() => {}} />
        </div>
      </div>
    </div>
  )
}
