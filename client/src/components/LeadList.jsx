import { useEffect, useMemo, useState } from 'react'
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
      return lead.name.toLowerCase().includes(q)
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
    restList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    return { today: todayList, overdue: overdueList, rest: restList }
  }, [filtered])

  const isEmpty = filtered.length === 0 && !isLoading

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          LeadFlow
        </h1>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0f0f0f] transition hover:bg-[var(--accent-hover)]"
        >
          Add New Lead
        </button>
      </header>

      <div className="mb-4">
        <label htmlFor="lead-search" className="sr-only">
          Search leads
        </label>
        <input
          id="lead-search"
          type="search"
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-[var(--border-focus)] focus:ring-2"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => {
          const active = filters.status === chip.value
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter('status', chip.value)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition ${
                active
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[#0f0f0f]'
                  : 'border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
              }`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      {isLoading && (
        <p className="text-center text-sm text-[var(--text-tertiary)]">Loading leads…</p>
      )}

      {isEmpty && !error && (
        <p className="py-16 text-center text-[var(--text-secondary)]">
          No leads found. Add one to get started.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {today.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[#FBBF24]/90">
              📌 Today&apos;s Follow-ups
            </h2>
            <ul className="flex flex-col gap-3">
              {today.map((lead) => (
                <li key={lead.id}>
                  <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {overdue.length > 0 && (
          <section>
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--overdue-text)]">
              ⚠ Overdue
            </h2>
            <ul className="flex flex-col gap-3">
              {overdue.map((lead) => (
                <li key={lead.id}>
                  <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {rest.length > 0 && (
          <section>
            {(today.length > 0 || overdue.length > 0) && (
              <h2 className="mb-3 font-display text-sm font-semibold text-[var(--text-tertiary)]">
                All leads
              </h2>
            )}
            <ul className="flex flex-col gap-3">
              {rest.map((lead) => (
                <li key={lead.id}>
                  <LeadCard lead={lead} onClick={() => selectLead(lead.id)} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <LeadDialog />
    </div>
  )
}
