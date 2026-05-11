import { format } from 'date-fns'
import { timeAgo, formatFollowUp } from '../utils/dateUtils.js'

export default function DiscussionItem({ discussion }) {
  const created = new Date(discussion.createdAt)
  const fullStamp = format(created, 'MMM d, yyyy · h:mm a')

  return (
    <div className="relative border-l-2 border-[var(--border-strong)] pb-10 pl-6 last:border-transparent last:pb-0">
      <span
        className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border border-[var(--bg-surface)] bg-[var(--accent)] shadow-sm"
        aria-hidden
      />
      <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--text-tertiary)]">
        {fullStamp}{' '}
        <span className="font-normal normal-case tracking-normal text-[var(--text-tertiary)]/75">
          · {timeAgo(discussion.createdAt)}
        </span>
      </p>
      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--text-primary)]">{discussion.note}</p>
      {discussion.followUpAt && (
        <p className="mt-3 inline-flex items-center rounded-full border border-[var(--accent)]/35 bg-[var(--accent-muted)] px-2.5 py-1 font-mono text-[0.6875rem] font-medium text-[var(--accent)]">
          Follow-up · {formatFollowUp(discussion.followUpAt)}
        </p>
      )}
    </div>
  )
}
