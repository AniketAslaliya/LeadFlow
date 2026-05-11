import { create } from 'zustand'
import {
  getLeads as apiGetLeads,
  createLead as apiCreateLead,
  updateLead as apiUpdateLead,
  getDiscussions as apiGetDiscussions,
  createDiscussion as apiCreateDiscussion,
} from '../api/leadApi.js'

const useLeadStore = create((set, get) => ({
  leads: [],
  selectedLeadId: null,
  discussions: {},
  filters: { status: 'All', search: '' },
  isLoading: false,
  error: null,

  fetchLeads: async () => {
    set({ isLoading: true, error: null })
    try {
      const leads = await apiGetLeads()
      set({ leads, isLoading: false })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to load leads',
        isLoading: false,
      })
      throw e
    }
  },

  addLead: async (leadData) => {
    const lead = await apiCreateLead(leadData)
    set((state) => ({ leads: [lead, ...state.leads] }))
    return lead
  },

  updateLead: async (id, patch) => {
    const updated = await apiUpdateLead(id, patch)
    set((state) => ({
      leads: state.leads.map((l) => (l.id === id ? { ...l, ...updated } : l)),
    }))
    return updated
  },

  selectLead: (leadId) => set({ selectedLeadId: leadId }),

  fetchDiscussions: async (leadId) => {
    if (get().discussions[leadId] !== undefined) return
    const rows = await apiGetDiscussions(leadId)
    set((state) => ({
      discussions: { ...state.discussions, [leadId]: rows },
    }))
  },

  addDiscussion: async (leadId, data) => {
    const created = await apiCreateDiscussion(leadId, data)
    set((state) => {
      const prev = state.discussions[leadId] ?? []
      const nextDiscussions = {
        ...state.discussions,
        [leadId]: [created, ...prev],
      }
      const nextLeads = state.leads.map((l) => {
        if (l.id !== leadId) return l
        const next = {
          ...l,
          lastDiscussion: { note: created.note, createdAt: created.createdAt },
        }
        if (created.followUpAt != null) {
          next.followUpAt = created.followUpAt
        }
        return next
      })
      return { discussions: nextDiscussions, leads: nextLeads }
    })
    return created
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
}))

export default useLeadStore
