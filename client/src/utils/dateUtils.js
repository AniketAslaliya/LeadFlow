import {
  format,
  formatDistanceToNow,
  startOfDay,
  isToday as isTodayFn,
  isTomorrow,
} from 'date-fns'

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isToday(date) {
  return isTodayFn(new Date(date))
}

/**
 * Overdue if follow-up date is strictly before the start of today.
 */
export function isOverdue(date) {
  if (date == null) return false
  const d = startOfDay(new Date(date))
  const today = startOfDay(new Date())
  return d < today
}

export function formatFollowUp(date) {
  const d = new Date(date)
  if (isTodayFn(d)) {
    return `Today at ${format(d, 'h:mm a')}`
  }
  if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`
  }
  return format(d, "MMM d 'at' h:mm a")
}
