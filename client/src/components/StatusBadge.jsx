const STATUS_STYLE = {
  New: { bg: 'rgba(124, 142, 163, 0.18)', color: 'var(--status-new)' },
  Contacted: { bg: 'rgba(124, 131, 243, 0.18)', color: 'var(--status-contacted)' },
  Qualified: { bg: 'rgba(27, 168, 154, 0.16)', color: 'var(--status-qualified)' },
  ProposalSent: { bg: 'rgba(225, 139, 18, 0.18)', color: 'var(--status-proposal-sent)' },
  Won: { bg: 'rgba(18, 161, 115, 0.16)', color: 'var(--status-won)' },
  Lost: { bg: 'rgba(227, 77, 104, 0.16)', color: 'var(--status-lost)' },
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
      className="inline-flex shrink-0 items-center rounded-full border border-white/[0.08] px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-primary)] font-mono"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {label}
    </span>
  )
}
