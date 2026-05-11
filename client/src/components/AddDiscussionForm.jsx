import { useState } from 'react'
import toast from 'react-hot-toast'
import useLeadStore from '../store/useLeadStore.js'

const inputClass =
  'rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:shadow-glow'

export default function AddDiscussionForm({ leadId, onSaved }) {
  const addDiscussion = useLeadStore((s) => s.addDiscussion)

  const [note, setNote] = useState('')
  const [setFollowUp, setSetFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [noteError, setNoteError] = useState('')

  const reset = () => {
    setNote('')
    setSetFollowUp(false)
    setFollowUpDate('')
    setFollowUpTime('')
    setNoteError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!note.trim()) {
      setNoteError('Note cannot be empty')
      return
    }
    setNoteError('')

    if (setFollowUp && (!followUpDate || !followUpTime)) {
      toast.error('Pick a follow-up date and time')
      return
    }

    let followUpAt
    if (setFollowUp && followUpDate && followUpTime) {
      const local = new Date(`${followUpDate}T${followUpTime}`)
      if (Number.isNaN(local.getTime())) {
        toast.error('Invalid follow-up date')
        return
      }
      followUpAt = local.toISOString()
    }

    setLoading(true)
    try {
      await addDiscussion(leadId, { note: note.trim(), followUpAt })
      toast.success('Note saved!')
      reset()
      onSaved?.()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={`note-${leadId}`} className="mb-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Note
        </label>
        <textarea
          id={`note-${leadId}`}
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            if (noteError) setNoteError('')
          }}
          placeholder="Log a call, email, or next step…"
          rows={4}
          className={`${inputClass} min-h-[100px] w-full resize-y`}
        />
        {noteError && <p className="mt-1.5 text-sm text-red-400/95">{noteError}</p>}
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={setFollowUp}
          onChange={(e) => setSetFollowUp(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-input)] text-[var(--accent)]"
        />
        Schedule follow-up on lead
      </label>

      {setFollowUp && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={inputClass} />
          <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} className={inputClass} />
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#0c0d12] shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </form>
  )
}
