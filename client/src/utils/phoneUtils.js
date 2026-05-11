/** @typedef {{ dial: string; label: string }} DialOption */

/** Default when the number has no international prefix. */
export const DEFAULT_DIAL = '+1'

/**
 * Common dial codes — sorted by `dial` length descending for prefix matching.
 * Stored phone on the server is one string, e.g. `+15551234567`.
 */
const RAW_DIAL_CODES = [
  { dial: '+358', label: 'Finland' },
  { dial: '+353', label: 'Ireland' },
  { dial: '+352', label: 'Luxembourg' },
  { dial: '+351', label: 'Portugal' },
  { dial: '+356', label: 'Malta' },
  { dial: '+357', label: 'Cyprus' },
  { dial: '+370', label: 'Lithuania' },
  { dial: '+371', label: 'Latvia' },
  { dial: '+372', label: 'Estonia' },
  { dial: '+386', label: 'Slovenia' },
  { dial: '+385', label: 'Croatia' },
  { dial: '+381', label: 'Serbia' },
  { dial: '+380', label: 'Ukraine' },
  { dial: '+359', label: 'Bulgaria' },
  { dial: '+40', label: 'Romania' },
  { dial: '+36', label: 'Hungary' },
  { dial: '+420', label: 'Czechia' },
  { dial: '+421', label: 'Slovakia' },
  { dial: '+30', label: 'Greece' },
  { dial: '+32', label: 'Belgium' },
  { dial: '+31', label: 'Netherlands' },
  { dial: '+34', label: 'Spain' },
  { dial: '+39', label: 'Italy' },
  { dial: '+41', label: 'Switzerland' },
  { dial: '+43', label: 'Austria' },
  { dial: '+44', label: 'United Kingdom' },
  { dial: '+45', label: 'Denmark' },
  { dial: '+46', label: 'Sweden' },
  { dial: '+47', label: 'Norway' },
  { dial: '+48', label: 'Poland' },
  { dial: '+49', label: 'Germany' },
  { dial: '+51', label: 'Peru' },
  { dial: '+52', label: 'Mexico' },
  { dial: '+54', label: 'Argentina' },
  { dial: '+55', label: 'Brazil' },
  { dial: '+56', label: 'Chile' },
  { dial: '+57', label: 'Colombia' },
  { dial: '+58', label: 'Venezuela' },
  { dial: '+60', label: 'Malaysia' },
  { dial: '+61', label: 'Australia' },
  { dial: '+62', label: 'Indonesia' },
  { dial: '+63', label: 'Philippines' },
  { dial: '+64', label: 'New Zealand' },
  { dial: '+65', label: 'Singapore' },
  { dial: '+66', label: 'Thailand' },
  { dial: '+81', label: 'Japan' },
  { dial: '+82', label: 'South Korea' },
  { dial: '+84', label: 'Vietnam' },
  { dial: '+86', label: 'China' },
  { dial: '+90', label: 'Türkiye' },
  { dial: '+91', label: 'India' },
  { dial: '+92', label: 'Pakistan' },
  { dial: '+93', label: 'Afghanistan' },
  { dial: '+94', label: 'Sri Lanka' },
  { dial: '+95', label: 'Myanmar' },
  { dial: '+98', label: 'Iran' },
  { dial: '+212', label: 'Morocco' },
  { dial: '+234', label: 'Nigeria' },
  { dial: '+254', label: 'Kenya' },
  { dial: '+27', label: 'South Africa' },
  { dial: '+20', label: 'Egypt' },
  { dial: '+971', label: 'UAE' },
  { dial: '+966', label: 'Saudi Arabia' },
  { dial: '+972', label: 'Israel' },
  { dial: '+1', label: 'US / CA' },
]

/** @type {DialOption[]} */
export const DIAL_CODES = (() => {
  const seen = new Set()
  const rows = []
  for (const row of RAW_DIAL_CODES) {
    const dial = row.dial.trim()
    if (!/^\+\d+$/.test(dial) || seen.has(dial)) continue
    seen.add(dial)
    rows.push({ dial, label: row.label })
  }
  return rows.sort((a, b) => b.dial.length - a.dial.length)
})()

/**
 * @param {string | null | undefined} raw
 * @returns {{ dial: string; nationalDigits: string }}
 */
export function parseStoredPhone(raw) {
  if (raw == null || String(raw).trim() === '') {
    return { dial: DEFAULT_DIAL, nationalDigits: '' }
  }
  const compact = String(raw).replace(/\s/g, '')
  if (!compact.startsWith('+')) {
    return {
      dial: DEFAULT_DIAL,
      nationalDigits: compact.replace(/\D/g, ''),
    }
  }
  for (const { dial } of DIAL_CODES) {
    if (compact.startsWith(dial)) {
      return {
        dial,
        nationalDigits: compact.slice(dial.length).replace(/\D/g, ''),
      }
    }
  }
  return {
    dial: DEFAULT_DIAL,
    nationalDigits: compact.replace(/^\+/, '').replace(/\D/g, ''),
  }
}

/**
 * @param {string} dial e.g. +1
 * @param {string} national local digits only
 * @returns {string | undefined} E.164-ish compact string or undefined if empty
 */
export function combinePhone(dial, national) {
  const d = dial.trim()
  const digits = String(national).replace(/\D/g, '')
  if (!digits) return undefined
  if (!d.startsWith('+')) return `+${digits}`
  return `${d}${digits}`
}

/**
 * Human-readable line (not strict locale formatting).
 * @param {string | null | undefined} raw
 */
export function formatPhoneDisplay(raw) {
  if (raw == null || String(raw).trim() === '') return ''
  const { dial, nationalDigits } = parseStoredPhone(raw)
  if (!nationalDigits) return dial
  return `${dial} ${nationalDigits}`
}

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function telHref(raw) {
  if (raw == null || String(raw).trim() === '') return null
  const compact = String(raw).replace(/\s/g, '')
  if (compact.startsWith('+')) return `tel:${compact}`
  const digits = compact.replace(/\D/g, '')
  if (!digits) return null
  return `tel:+${digits}`
}
