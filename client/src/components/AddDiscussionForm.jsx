import { useState } from 'react'
import toast from 'react-hot-toast'
import useLeadStore from '../store/useLeadStore.js'

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
    <form onSubmit={handleSubmit} className="border-t border-[var(--border)] pt-4">
      <label htmlFor={`note-${leadId}`} className="sr-only">
        Discussion note
      </label>
      <textarea
        id={`note-${leadId}`}
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          if (noteError) setNoteError('')
        }}
        placeholder="Log a new discussion…"
        rows={4}
        className="min-h-[80px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none ring-[var(--border-focus)] focus:ring-2"
      />
      {noteError && <p className="mt-1 text-sm text-red-400">{noteError}</p>}

      <label className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={setFollowUp}
          onChange={(e) => setSetFollowUp(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--accent)]"
        />
        Set follow-up
      </label>

      {setFollowUp && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-focus)] focus:ring-2"
          />
          <input
            type="time"
            value={followUpTime}
            onChange={(e) => setFollowUpTime(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--border-focus)] focus:ring-2"
          />
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0f0f0f] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </form>
  )
}
