import StatusBadge from './StatusBadge.jsx'
import { isToday, isOverdue, timeAgo } from '../utils/dateUtils.js'
import { format } from 'date-fns'

const STATUS_BORDER = {
  New: 'var(--status-new)',
  Contacted: 'var(--status-contacted)',
  Qualified: 'var(--status-qualified)',
  ProposalSent: 'var(--status-proposal-sent)',
  Won: 'var(--status-won)',
  Lost: 'var(--status-lost)',
}

export default function LeadCard({ lead, onClick }) {
  const followUp = lead.followUpAt ? new Date(lead.followUpAt) : null
  const todayFollowUp = followUp && isToday(followUp)
  const overdue = followUp && isOverdue(followUp)

  const borderColor = overdue ? 'var(--overdue-border)' : STATUS_BORDER[lead.status] ?? STATUS_BORDER.New
  const accentBg = overdue ? 'var(--overdue-bg)' : 'var(--bg-surface)'

  const lastNote = lead.lastDiscussion?.note ?? 'No notes yet'
  const lastAt = lead.lastDiscussion?.createdAt

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-[var(--border)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-px hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
      style={{
        backgroundColor: accentBg,
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold text-[var(--text-primary)] truncate">
            {lead.name}
          </h3>
          {(lead.company || lead.phone) && (
            <p className="mt-0.5 font-mono text-xs text-[var(--text-secondary)] truncate">
              {[lead.company, lead.phone].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <p className="mt-3 line-clamp-1 text-sm text-[var(--text-tertiary)]">{lastNote}</p>
      {lastAt && (
        <p className="mt-1 font-mono text-xs text-[var(--text-tertiary)]">{timeAgo(lastAt)}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {todayFollowUp && (
          <span className="inline-flex rounded-full bg-[#422006]/80 px-2 py-0.5 font-mono text-xs text-[#FBBF24] ring-1 ring-[var(--accent)]/40">
            Follow-up today at {format(followUp, 'h:mm a')}
          </span>
        )}
        {overdue && (
          <span className="inline-flex rounded-full bg-[#450a0a]/80 px-2 py-0.5 font-mono text-xs text-[var(--overdue-text)] ring-1 ring-[var(--overdue-border)]/50">
            Overdue: was {format(followUp, "MMM d, yyyy 'at' h:mm a")}
          </span>
        )}
      </div>
    </button>
  )
}
