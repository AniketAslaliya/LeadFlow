async function parseJsonSafe(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

async function handleResponse(response) {
  const body = await parseJsonSafe(response)
  if (!response.ok) {
    const message =
      typeof body?.error === 'string'
        ? body.error
        : body?.error != null
          ? String(body.error)
          : response.statusText || 'Request failed'
    throw new Error(message)
  }
  return body
}

export async function getLeads(opts = {}) {
  const take = opts.take ?? 500
  const skip = opts.skip
  const sp = new URLSearchParams()
  sp.set('take', String(Math.min(500, Math.max(1, take))))
  if (skip != null && skip > 0) sp.set('skip', String(skip))
  const res = await fetch(`/api/leads?${sp.toString()}`)
  const body = await handleResponse(res)
  return body.data
}

export async function createLead({ name, company, phone, status }) {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, company, phone, status }),
  })
  const body = await handleResponse(res)
  return body.data
}

export async function updateLead(id, patch) {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  const body = await handleResponse(res)
  return body.data
}

export async function getDiscussions(leadId) {
  const res = await fetch(`/api/leads/${leadId}/discussions`)
  const body = await handleResponse(res)
  return body.data
}

export async function createDiscussion(leadId, { note, followUpAt }) {
  const res = await fetch(`/api/leads/${leadId}/discussions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, followUpAt }),
  })
  const body = await handleResponse(res)
  return body.data
}
