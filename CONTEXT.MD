# LeadFlow — Project Context

> This file is the source of truth for any AI assistant (Cursor, Claude, Copilot) working on this codebase.  
> Read this before generating or modifying any code.

---

## What Is This?

LeadFlow is a **single-screen Lead Management / lightweight CRM** built as a coding assessment for Es Magico. It is a real-world tool — not a toy project. The evaluators will look for production-quality decisions: clean component structure, correct HTTP status codes, meaningful error handling, and a git history that tells a story.

---

## Who Uses This?

A **sales rep** who opens this tool at the start of their day to:
1. See who needs follow-up today (pinned at top)
2. Check overdue leads (highlighted red)
3. Log a note after a call
4. Move a lead forward in the pipeline
5. Add a brand new lead from a call/email

There is NO multi-user, NO auth requirement (optional), NO dashboard analytics. Keep it focused.

---

## Folder Structure

```
leadflow/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LeadCard.jsx         # Single lead row/card
│   │   │   ├── LeadList.jsx         # The main list with filters
│   │   │   ├── LeadDialog.jsx       # Timeline dialog (click on lead)
│   │   │   ├── AddLeadModal.jsx     # Modal to create new lead
│   │   │   ├── StatusBadge.jsx      # Reusable colored status pill
│   │   │   ├── DiscussionItem.jsx   # Single discussion entry in timeline
│   │   │   └── AddDiscussionForm.jsx # Note + follow-up form at bottom of dialog
│   │   ├── store/
│   │   │   └── useLeadStore.js      # Zustand store — single source of truth
│   │   ├── api/
│   │   │   └── leadApi.js           # All fetch() calls centralized here
│   │   ├── utils/
│   │   │   └── dateUtils.js         # timeAgo(), isToday(), isOverdue()
│   │   ├── styles/
│   │   │   └── globals.css          # CSS variables, base styles, typography
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── leads.js             # /api/leads routes
│   │   │   └── discussions.js       # /api/leads/:id/discussions routes
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Central error handler
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js              # Seed script
│   │   └── index.js                 # Express app entry
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── README.md
├── PRD.md
├── CONTEXT.md
└── ROADMAP.md
```

---

## State Management Rules

- **Zustand store** (`useLeadStore`) holds:
  - `leads[]` — full list with embedded `lastDiscussion`
  - `selectedLead` — the lead whose dialog is open (null if closed)
  - `discussions{}` — keyed by leadId, lazy-loaded when dialog opens
  - `filters` — `{ status: 'All', search: '' }`
  - Actions: `fetchLeads`, `addLead`, `updateLead`, `fetchDiscussions`, `addDiscussion`

- **No prop drilling beyond 2 levels.** If a component needs store data, it reads from the store directly.
- **Optimistic updates**: When adding a discussion, update the store immediately, then sync with the API. Roll back on error.

---

## API Rules

- All routes prefixed with `/api`
- All responses are JSON
- Error responses always have shape: `{ error: string, details?: any }`
- Success responses for lists: `{ data: [...] }`
- Success responses for single items: `{ data: {...} }`
- Use `express-validator` for input validation
- The server runs on `PORT=3001`, the client on `PORT=5173` (Vite default)
- Vite proxies `/api` → `localhost:3001` (configured in `vite.config.js`)

---

## Design System (CSS Variables)

```css
/* globals.css */
:root {
  --bg-primary:     #0F0F0F;    /* Main background */
  --bg-surface:     #1A1A1A;    /* Cards, dialogs */
  --bg-elevated:    #242424;    /* Hover states, inputs */
  --text-primary:   #F5F0E8;    /* Main text */
  --text-secondary: #9A9490;    /* Secondary / muted */
  --text-tertiary:  #5C5856;    /* Timestamps, hints */
  --accent:         #D97706;    /* CTA, highlights */
  --accent-hover:   #B45309;
  --border:         #2A2A2A;
  --border-focus:   #D97706;

  /* Status colors */
  --status-new:           #64748B;
  --status-contacted:     #6366F1;
  --status-qualified:     #0D9488;
  --status-proposal-sent: #D97706;
  --status-won:           #059669;
  --status-lost:          #E11D48;

  /* Overdue */
  --overdue-bg:     #1F0A0A;
  --overdue-border: #E11D48;
  --overdue-text:   #F87171;

  /* Typography */
  --font-display: 'Sora', sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;
}
```

---

## Key Business Logic

### "Today's Follow-ups Pinned"
```js
// Sort order:
// 1. Leads where followUpAt is TODAY (date only, ignore time)
// 2. Leads where followUpAt is OVERDUE (past, not today)
// 3. All other leads (by updatedAt desc)
```

### "Time Since Last Discussion"
```js
// Uses date-fns formatDistanceToNow()
// e.g. "2 days ago", "just now", "5 hours ago"
// If no discussions: show "No notes yet"
```

### "Overdue Follow-up"
```js
// followUpAt < today's date (start of day) → overdue
// Show red left border on card + red timestamp
```

---

## Git Commit Convention

Use this format — evaluators check history:
```
feat(module): description

Examples:
feat(db): add Prisma schema and seed script
feat(api): implement leads CRUD endpoints
feat(ui): build LeadList with filter and search
feat(ui): build LeadDialog with discussion timeline
feat(ui): build AddLeadModal
fix(api): correct 404 handling for missing lead
chore: add Docker Compose and .env.example
docs: finalize README with setup instructions
```

---

## What NOT To Do

- ❌ Don't use `create-react-app` (use Vite)
- ❌ Don't use `moment.js` (use `date-fns`)
- ❌ Don't use Redux (use Zustand)
- ❌ Don't use raw `fetch` scattered in components (centralize in `api/leadApi.js`)
- ❌ Don't use inline styles (use Tailwind + CSS variables)
- ❌ Don't open a new page/route for the lead dialog (must be a modal/dialog)
- ❌ Don't forget `.env.example` — evaluators will check
- ❌ Don't use generic blue/purple color scheme
- ❌ Don't use Inter or Roboto fonts

---

## Performance Notes

- Fetch discussions lazily (only when a lead dialog is opened)
- Debounce the search input by 300ms
- Don't re-fetch all leads after adding a discussion — update the store directly