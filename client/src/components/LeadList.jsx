import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Plus,
  Pin,
  AlertTriangle,
  Inbox,
  Layers,
  ArrowUpDown,
  X,
  Keyboard,
} from 'lucide-react'
import useLeadStore from '../store/useLeadStore.js'
import LeadCard from './LeadCard.jsx'
import AddLeadModal from './AddLeadModal.jsx'
import LeadDialog from './LeadDialog.jsx'
import { isToday, isOverdue } from '../utils/dateUtils.js'
import { formatPhoneDisplay } from '../utils/phoneUtils.js'

const STATUS_CHIPS = [
  { value: 'All', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'ProposalSent', label: 'Proposal Sent' },
  { value: 'Won', label: 'Won' },
  { value: 'Lost', label: 'Lost' },
]

const SORT_OPTIONS = [
  { value: 'activity', label: 'Last activity' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'followUp', label: 'Follow-up (soonest)' },
]

function sortRestLeads(list, sortBy) {
  const copy = [...list]
  if (sortBy === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  } else if (sortBy === 'followUp') {
    copy.sort((a, b) => {
      if (!a.followUpAt && !b.followUpAt) {
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
      if (!a.followUpAt) return 1
      if (!b.followUpAt) return -1
      return new Date(a.followUpAt) - new Date(b.followUpAt)
    })
  } else {
    copy.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }
  return copy
}

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

  const searchRef = useRef(null)
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

  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      const tag = el && /** @type {HTMLElement} */ (el).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const filtered = useMemo(() => {
    const q = filters.search
    return leads.filter((lead) => {
      if (filters.status !== 'All' && lead.status !== filters.status) return false
      if (!q) return true
      const phoneDisp = formatPhoneDisplay(lead.phone).toLowerCase()
      const hay = [lead.name, lead.company, lead.phone, phoneDisp]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [leads, filters.status, filters.search])

  const { today, overdue, rest, totalToday, totalOverdue } = useMemo(() => {
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
    const sortBy = filters.sortBy ?? 'activity'
    const restSorted = sortRestLeads(restList, sortBy)
    return {
      today: todayList,
      overdue: overdueList,
      rest: restSorted,
      totalToday: todayList.length,
      totalOverdue: overdueList.length,
    }
  }, [filtered, filters.sortBy])

  const isEmpty = filtered.length === 0 && !isLoading

  let staggerIndex = 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-3 sm:px-5 lg:px-8">
        <header className="shrink-0 border-b border-[var(--border)] pb-5 pt-4 sm:flex sm:items-end sm:justify-between sm:pb-6 sm:pt-6">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Sales workspace
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              LeadFlow
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Pipeline, discussions, and follow-ups in one screen — tuned for daily rep workflows.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#0c0d12] shadow-md shadow-black/25 transition hover:bg-[var(--accent-hover)] active:scale-[0.98] sm:mt-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            New lead
          </button>
        </header>

        <div className="shrink-0 space-y-3 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 py-3 sm:py-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
            <span>
              <span className="text-[var(--text-secondary)]">{filtered.length}</span> shown
              <span className="mx-1.5 text-[var(--border-strong)]">·</span>
              <span className="text-[var(--text-secondary)]">{leads.length}</span> total
            </span>
            {totalToday > 0 && (
              <>
                <span className="hidden text-[var(--border-strong)] sm:inline">·</span>
                <span className="text-[var(--accent)]">{totalToday} due today</span>
              </>
            )}
            {totalOverdue > 0 && (
              <>
                <span className="hidden text-[var(--border-strong)] sm:inline">·</span>
                <span className="text-[var(--overdue-text)]">{totalOverdue} overdue</span>
              </>
            )}
            <span className="ml-auto hidden items-center gap-1 sm:flex">
              <Keyboard className="h-3 w-3" aria-hidden />
              <span className="normal-case tracking-normal text-[var(--text-tertiary)]">Press</span>
              <kbd className="rounded border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-1.5 py-0.5 font-mono text-[0.625rem] text-[var(--text-secondary)]">
                /
              </kbd>
              <span className="normal-case tracking-normal text-[var(--text-tertiary)]">to search</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="lead-search" className="sr-only">
                Search leads
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]"
                strokeWidth={2}
                aria-hidden
              />
              <input
                ref={searchRef}
                id="lead-search"
                type="search"
                placeholder="Search name, company, or phone…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-3.5 pl-11 pr-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] shadow-inner outline-none ring-0 transition focus:border-[var(--border-focus)] focus:shadow-glow"
              />
              {searchInput.trim() !== '' && (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  onClick={() => {
                    setSearchInput('')
                    searchRef.current?.focus()
                  }}
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ArrowUpDown className="hidden h-4 w-4 text-[var(--text-tertiary)] sm:block" aria-hidden />
              <label htmlFor="lead-sort" className="sr-only">
                Sort leads
              </label>
              <select
                id="lead-sort"
                value={filters.sortBy ?? 'activity'}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-input)] py-3 pl-3 pr-8 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow sm:w-[11.5rem]"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-0.5 [scrollbar-width:thin]">
            <div className="flex w-max min-w-full flex-nowrap gap-2">
              {STATUS_CHIPS.map((chip) => {
                const active = filters.status === chip.value
                return (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setFilter('status', chip.value)}
                    className={`shrink-0 rounded-full border px-3.5 py-2 font-mono text-[0.6875rem] font-medium uppercase tracking-wide transition ${
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
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-4 [scrollbar-gutter:stable]">
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
            <div className="flex flex-col gap-10 pb-8">
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
        </main>
      </div>

      <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <LeadDialog />
    </div>
  )
}
