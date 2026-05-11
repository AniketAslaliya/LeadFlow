import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Pin, AlertTriangle, Inbox, Layers } from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'
import LeadCard from './LeadCard.jsx'
import AddLeadModal from './AddLeadModal.jsx'
import LeadDialog from './LeadDialog.jsx'
import { isToday, isOverdue } from '../utils/dateUtils.js'

const STATUS_CHIPS = [
  { value: 'All', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'ProposalSent', label: 'Proposal Sent' },
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
]

function LeadSkeletonRow() {
  return (
    <div className="animate-pulse rounded-card border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-card ring-1 ring-white/[0.03]">
      <div className="flex justify-between gap-3">
        <div className="h-5 w-40 rounded-md bg-[var(--bg-elevated)]" />
        <div className="h-6 w-20 rounded-full bg-[var(--bg-elevated)]" />
      </div>
      <div className="mt-3 h-4 w-full max-w-md rounded-md bg-[var(--bg-elevated)]" />
      <div className="mt-2 h-3 w-24 rounded-md bg-[var(--bg-elevated)]" />
    </div>
  )
}

function SectionLabel({ icon: Icon, children, tone }) {
  const tones = {
    amber: 'text-[var(--accent)]',
    rose: 'text-[var(--overdue-text)]',
    muted: 'text-[var(--text-tertiary)]',
  }
  return (
    <h2
      className={`mb-3 flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}
    >
      <Icon className="h-3.5 w-3.5 opacity-90" strokeWidth={2.25} aria-hidden />
      {children}
    </h2>
  )
}

export default function LeadList() {
  const leads = useLeadStore((s) => s.leads)
  const filters = useLeadStore((s) => s.filters)
  const isLoading = useLeadStore((s) => s.isLoading)
  const error = useLeadStore((s) => s.error)
  const fetchLeads = useLeadStore((s) => s.fetchLeads)
  const setFilter = useLeadStore((s) => s.setFilter)
  const selectLead = useLeadStore((s) => s.selectLead)

  const [searchInput, setSearchInput] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchLeads().catch(() => {})
  }, [fetchLeads])

  useEffect(() => {
    const id = setTimeout(() => {
      setFilter('search', searchInput.trim().toLowerCase())
    }, 300)
    return () => clearTimeout(id)
  }, [searchInput, setFilter])

  const filtered = useMemo(() => {
    const q = filters.search
    return leads.filter((lead) => {
      if (filters.status !== 'All' && lead.status !== filters.status) return false
      if (!q) return true
      const hay = [lead.name, lead.company, lead.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [leads, filters.status, filters.search])

  const { today, overdue, rest } = useMemo(() => {
    const todayList = []
    const overdueList = []
    const restList = []
    for (const lead of filtered) {
      const fu = lead.followUpAt
      if (fu && isToday(fu)) {
        todayList.push(lead)
      } else if (fu && isOverdue(fu)) {
        overdueList.push(lead)
      } else {
        restList.push(lead)
      }
    }
    const byFollowUpAsc = (a, b) => new Date(a.followUpAt) - new Date(b.followUpAt)
    todayList.sort(byFollowUpAsc)
    overdueList.sort(byFollowUpAsc)
    restList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    return { today: todayList, overdue: overdueList, rest: restList }
  }, [filtered])

  const isEmpty = filtered.length === 0 && !isLoading

  let staggerIndex = 0

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-12 pt-8 sm:px-6 lg:max-w-4xl lg:px-8">
      <header className="mb-8 flex flex-col gap-6 border-b border-[var(--border)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Sales workspace
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            LeadFlow
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Pipeline, discussions, and follow-ups in one focused view.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0c0d12] shadow-md shadow-black/25 transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          New lead
        </button>
      </header>

      <div className="mb-5">
        <label htmlFor="lead-search" className="sr-only">
          Search leads
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            id="lead-search"
            type="search"
            placeholder="Search by name or company…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-inner outline-none ring-0 transition focus:border-[var(--border-focus)] focus:shadow-glow"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const active = filters.status === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter('status', chip.value)}
              className={`rounded-full border px-3.5 py-2 font-mono text-[0.6875rem] font-medium uppercase tracking-wide transition ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[#0c0d12] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg-surface)]/90 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-950/25 px-4 py-3 text-sm text-red-200/95">
          {error}
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading leads">
          {Array.from({ length: 6 }, (_, i) => (
            <LeadSkeletonRow key={i} />
          ))}
        </div>
      )}

      {isEmpty && !error && (
        <div className="flex flex-col items-center justify-center rounded-modal border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]/50 px-6 py-16 text-center ring-1 ring-white/[0.03]">
          <Inbox className="mb-4 h-10 w-10 text-[var(--text-tertiary)]" strokeWidth={1.5} aria-hidden />
          <p className="font-display text-base font-semibold text-[var(--text-primary)]">No leads match</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Adjust filters or add a lead to build your pipeline here.
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-10">
          {today.length > 0 && (
            <section>
              <SectionLabel icon={Pin} tone="amber">
                Today&apos;s follow-ups
              </SectionLabel>
              <ul className="flex flex-col gap-3">
                {today.map((lead) => {
                  const delay = staggerIndex++
                  return (
                    <li
                      key={lead.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${delay * 55}ms` }}
                    >
                      <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {overdue.length > 0 && (
            <section>
              <SectionLabel icon={AlertTriangle} tone="rose">
                Overdue
              </SectionLabel>
              <ul className="flex flex-col gap-3">
                {overdue.map((lead) => {
                  const delay = staggerIndex++
                  return (
                    <li
                      key={lead.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${delay * 55}ms` }}
                    >
                      <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {rest.length > 0 && (
            <section>
              {(today.length > 0 || overdue.length > 0) && (
                <SectionLabel icon={Layers} tone="muted">
                  All leads
                </SectionLabel>
              )}
              <ul className="flex flex-col gap-3">
                {rest.map((lead) => {
                  const delay = staggerIndex++
                  return (
                    <li
                      key={lead.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${delay * 55}ms` }}
                    >
                      <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>
      )}

      <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <LeadDialog />
    </div>
  )
}
