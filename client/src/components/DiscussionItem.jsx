import { format } from 'date-fns'
import { timeAgo, formatFollowUp } from '../utils/dateUtils.js'

export default function DiscussionItem({ discussion }) {
  const created = new Date(discussion.createdAt)
  const fullStamp = format(created, 'MMM d, yyyy · h:mm a')

  return (
    <div className="relative border-l-2 border-[var(--border)] pb-10 pl-6 last:border-transparent last:pb-0">
      <span
        className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[#1A1A1A]"
        aria-hidden
      />
      <p className="font-mono text-xs text-[var(--text-tertiary)]">
        {fullStamp}{' '}
        <span className="text-[var(--text-tertiary)]/80">({timeAgo(discussion.createdAt)})</span>
      </p>
      <p className="mt-2 text-[var(--text-primary)]">{discussion.note}</p>
      {discussion.followUpAt && (
        <p className="mt-3 inline-flex rounded-full bg-[#422006]/80 px-2 py-0.5 font-mono text-xs text-[#FBBF24] ring-1 ring-[var(--accent)]/40">
          Follow-up set for: {formatFollowUp(discussion.followUpAt)}
        </p>
      )}
    </div>
  )
}
