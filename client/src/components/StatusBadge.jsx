const STATUS_STYLE = {
  New: { bg: 'rgba(100, 116, 139, 0.2)', color: 'var(--status-new)' },
  Contacted: { bg: 'rgba(99, 102, 241, 0.2)', color: 'var(--status-contacted)' },
  Qualified: { bg: 'rgba(13, 148, 136, 0.2)', color: 'var(--status-qualified)' },
  ProposalSent: { bg: 'rgba(217, 119, 6, 0.2)', color: 'var(--status-proposal-sent)' },
  Won: { bg: 'rgba(5, 150, 105, 0.2)', color: 'var(--status-won)' },
  Lost: { bg: 'rgba(225, 29, 72, 0.2)', color: 'var(--status-lost)' },
}

const STATUS_LABEL = {
  New: 'NEW',
  Contacted: 'CONTACTED',
  Qualified: 'QUALIFIED',
  ProposalSent: 'PROPOSAL SENT',
  Won: 'WON',
  Lost: 'LOST',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.New
  const label = STATUS_LABEL[status] ?? String(status).toUpperCase()

  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-wider font-mono"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {label}
    </span>
  )
}
