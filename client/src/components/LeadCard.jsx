import StatusBadge from './StatusBadge.jsx'
import { isToday, isOverdue, timeAgo } from '../utils/dateUtils.js'
import { formatPhoneDisplay } from '../utils/phoneUtils.js'
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
  const phoneLine = formatPhoneDisplay(lead.phone)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-card border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left shadow-card ring-1 ring-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]"
      style={{
        backgroundColor: accentBg,
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.0625rem] font-semibold tracking-tight text-[var(--text-primary)] transition group-hover:text-white truncate">
            {lead.name}
          </h3>
          {(lead.company || phoneLine) && (
            <p className="mt-1 font-mono text-[0.75rem] leading-snug text-[var(--text-secondary)] truncate">
              {[lead.company, phoneLine].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-tertiary)]">{lastNote}</p>
      {lastAt && (
        <p className="mt-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--text-tertiary)]">
          {timeAgo(lastAt)}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {todayFollowUp && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/35 bg-[var(--accent-muted)] px-2.5 py-1 font-mono text-[0.6875rem] font-medium text-[var(--accent)]">
            Follow-up today · {format(followUp, 'h:mm a')}
          </span>
        )}
        {overdue && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--overdue-border)]/40 bg-[var(--overdue-bg)] px-2.5 py-1 font-mono text-[0.6875rem] font-medium text-[var(--overdue-text)]">
            Overdue · {format(followUp, "MMM d, yyyy 'at' h:mm a")}
          </span>
        )}
      </div>
    </button>
  )
}
