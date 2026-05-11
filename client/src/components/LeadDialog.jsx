import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'
import DiscussionItem from './DiscussionItem.jsx'
import AddDiscussionForm from './AddDiscussionForm.jsx'

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'ProposalSent', label: 'Proposal Sent' },
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
]

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
        await fetchDiscussions(selectedLeadId)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="presentation"
      onClick={close}
    >
      <div
        key={selectedLeadId}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-dialog-title"
        className="flex max-h-[90vh] w-full max-w-[600px] animate-fade-in-up flex-col rounded-modal border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-modal ring-1 ring-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[var(--border)] bg-[var(--bg-surface)] p-6 pb-5">
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-lg p-2 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          <h2 id="lead-dialog-title" className="font-display pr-12 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {lead.name}
          </h2>
          {(lead.company || lead.phone) && (
            <p className="mt-2 font-mono text-sm text-[var(--text-secondary)]">
              {[lead.company, lead.phone].filter(Boolean).join(' · ')}
            </p>
          )}
          <label htmlFor="lead-status" className="mt-5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
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

        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--bg-surface)] px-6 py-5">
          <AddDiscussionForm leadId={selectedLeadId} onSaved={() => {}} />
        </div>
      </div>
    </div>
  )
}
