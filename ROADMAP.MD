# LeadFlow — Build Roadmap

> Follow this file **module by module**. Complete one module fully, run the validation checklist, commit to Git, then move to the next.  
> Each module includes a **ready-to-paste Cursor Composer prompt**.

---

## Pre-Flight Checklist

Before starting any module, ensure:
- [ ] Node.js 18+ installed
- [ ] PostgreSQL running (or Docker available)
- [ ] Cursor Pro open with this repo as the workspace
- [ ] Read `PRD.md` and `CONTEXT.md` once

---

---

# MODULE 0 — Project Scaffold

**Goal:** Create the full folder structure, install all dependencies, wire up Vite proxy, set up Tailwind, and confirm the dev servers run without errors.

**Time estimate:** 30 minutes

---

### Cursor Composer Prompt — Module 0

```
You are scaffolding a project called LeadFlow. It is a fullstack app:
- Frontend: React 18 + Vite + Tailwind CSS v3 + Zustand + date-fns + Lucide React + react-hot-toast
- Backend: Node.js + Express + Prisma + PostgreSQL

Create the following structure:

leadflow/
  client/   ← Vite React app
  server/   ← Express app

### CLIENT SETUP:
1. Run: npm create vite@latest client -- --template react
2. Install: tailwindcss postcss autoprefixer zustand date-fns lucide-react react-hot-toast
3. Init Tailwind: npx tailwindcss init -p
4. Configure tailwind.config.js to scan ./src/**/*.{js,jsx}
5. Add to index.css:
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

6. In vite.config.js, add a proxy:
   server: {
     proxy: {
       '/api': 'http://localhost:3001'
     }
   }

7. Create src/styles/globals.css with ALL CSS variables from CONTEXT.md design system
8. Import globals.css in main.jsx BEFORE index.css

9. Create these EMPTY placeholder files (just export a default empty component or function):
   - src/components/LeadCard.jsx
   - src/components/LeadList.jsx
   - src/components/LeadDialog.jsx
   - src/components/AddLeadModal.jsx
   - src/components/StatusBadge.jsx
   - src/components/DiscussionItem.jsx
   - src/components/AddDiscussionForm.jsx
   - src/store/useLeadStore.js
   - src/api/leadApi.js
   - src/utils/dateUtils.js

10. In App.jsx, render a simple <h1>LeadFlow is alive</h1> with dark background

### SERVER SETUP:
1. Create server/package.json with:
   - express, cors, dotenv, @prisma/client, express-validator
   - devDependencies: prisma, nodemon
   - scripts: "dev": "nodemon src/index.js", "db:migrate": "prisma migrate dev", "db:seed": "node src/prisma/seed.js"

2. Create server/src/index.js:
   - Express app on PORT from .env (default 3001)
   - JSON middleware
   - CORS allowing localhost:5173
   - Mount /api/leads router (empty for now)
   - Mount central error handler middleware
   - Console log "LeadFlow API running on port X"

3. Create server/src/middleware/errorHandler.js:
   - Catches errors, returns JSON { error: message }
   - 400 for validation errors, 404 for not found, 500 for everything else

4. Create .env.example at root:
   DATABASE_URL=postgresql://user:password@localhost:5432/leadflow
   PORT=3001
   NODE_ENV=development

5. Create .env at root (gitignored) with real local values

6. Create .gitignore at root covering: node_modules, .env, dist, .DS_Store, *.log

After all this, both servers should start without errors:
- client: npm run dev → http://localhost:5173
- server: npm run dev → http://localhost:3001
```

---

### Module 0 — Validation Checklist

Run these manually after the module is complete:

- [ ] `cd client && npm run dev` → opens without error
- [ ] `cd server && npm run dev` → prints "LeadFlow API running on port 3001"
- [ ] Browser shows dark background with "LeadFlow is alive"
- [ ] No TypeScript/Vite errors in terminal
- [ ] `.gitignore` exists and includes `.env`
- [ ] `.env.example` exists at root

### Git Commit
```bash
git init
git add .
git commit -m "chore: scaffold client and server, configure Tailwind and Vite proxy"
```

---
---

# MODULE 1 — Database Schema + Seed

**Goal:** Define Prisma schema, run migration, seed 6 leads with 2–3 discussions each.

**Time estimate:** 30 minutes

---

### Cursor Composer Prompt — Module 1

```
In the server/ directory, set up Prisma with PostgreSQL.

### PRISMA SCHEMA (server/prisma/schema.prisma):

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Lead {
  id          String       @id @default(uuid())
  name        String
  company     String?
  phone       String?
  status      LeadStatus   @default(New)
  followUpAt  DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  discussions Discussion[]
}

model Discussion {
  id         String    @id @default(uuid())
  leadId     String
  lead       Lead      @relation(fields: [leadId], references: [id], onDelete: Cascade)
  note       String
  followUpAt DateTime?
  createdAt  DateTime  @default(now())
}

enum LeadStatus {
  New
  Contacted
  Qualified
  ProposalSent
  Won
  Lost
}

### SEED SCRIPT (server/prisma/seed.js):

Create 6 leads with this data:

1. Sarah Connor | Acme Corp | 555-0199 | ProposalSent | followUpAt: today at 2:00 PM
   Discussions:
   - "Sent pricing tier PDF. Said she would review with her boss." (2 days ago, followUp: today 2PM)
   - "Initial discovery call. They need a CRM for 50 reps." (5 days ago)
   - "Lead created via web form." (6 days ago)

2. Hank Scorpio | Globex Inc | 555-0234 | Qualified | followUpAt: tomorrow
   Discussions:
   - "Budget approved internally. Waiting on legal to review MSA." (1 day ago)
   - "Demo went extremely well. They loved the pipeline view." (4 days ago)

3. Bill Lumbergh | Initech | 555-0087 | Contacted | followUpAt: 3 days ago (OVERDUE)
   Discussions:
   - "Left voicemail. No response yet. Will try email next." (3 days ago)
   - "Cold call — reached gatekeeper. Asked to call back." (5 days ago)

4. Bruce Wayne | Wayne Enterprises | null | Won | followUpAt: null
   Discussions:
   - "Contract signed! Onboarding scheduled for next week." (1 day ago)
   - "Final negotiation call. Agreed on annual pricing." (3 days ago)

5. Dwight Schrute | Dunder Mifflin | 555-0356 | New | followUpAt: null
   Discussions:
   - "Inbound lead via website contact form. Assigned to me." (just now / today)

6. Regina George | Plastics Inc | 555-0412 | Lost | followUpAt: null
   Discussions:
   - "Lost to competitor. Price was the deciding factor." (2 days ago)
   - "Follow-up call — she's reconsidering but not ready yet." (6 days ago)

Use actual Date objects calculated relative to new Date() at seed runtime.
Use prisma.lead.create with nested discussions (using create inside discussions).
Log each lead name as it's created.
End with: console.log('✅ Seed complete')

### COMMANDS TO RUN after generating files:
cd server
npx prisma migrate dev --name init
node prisma/seed.js
```

---

### Module 1 — Validation Checklist

- [ ] `npx prisma migrate dev` runs without error
- [ ] `node prisma/seed.js` prints 6 lead names + "✅ Seed complete"
- [ ] Open Prisma Studio: `npx prisma studio` → verify 6 leads and their discussions exist
- [ ] Bill Lumbergh's `followUpAt` is in the past (overdue)
- [ ] Sarah Connor's `followUpAt` is today

### Git Commit
```bash
git add .
git commit -m "feat(db): add Prisma schema, migration, and seed script with 6 leads"
```

---
---

# MODULE 2 — Backend API

**Goal:** Build all REST endpoints for leads and discussions, with validation and error handling.

**Time estimate:** 1 hour

---

### Cursor Composer Prompt — Module 2

```
Build the Express REST API for LeadFlow. Reference CONTEXT.md for response format rules.

### FILE: server/src/routes/leads.js

Implement these endpoints using Prisma:

GET /api/leads
  - Fetch all leads, ordered by: followUpAt ASC nulls last, updatedAt DESC
  - For each lead, include the most recent discussion (select only note and createdAt)
  - Return: { data: [...leads with lastDiscussion] }

POST /api/leads
  - Body: { name, company?, phone?, status? }
  - Validate: name is required and non-empty (use express-validator)
  - Default status: New
  - Return 201: { data: createdLead }
  - Return 400 if validation fails: { error: "Validation failed", details: [...] }

PATCH /api/leads/:id
  - Body: any combination of { status?, followUpAt?, name?, company?, phone? }
  - If lead not found: return 404 { error: "Lead not found" }
  - Return 200: { data: updatedLead }

DELETE /api/leads/:id  (bonus, optional)
  - Soft-delete or hard-delete
  - Return 200: { data: { deleted: true } }

### FILE: server/src/routes/discussions.js

GET /api/leads/:id/discussions
  - Fetch all discussions for leadId, ordered by createdAt DESC
  - If lead not found: 404
  - Return: { data: [...discussions] }

POST /api/leads/:id/discussions
  - Body: { note, followUpAt? }
  - Validate: note is required and non-empty
  - If followUpAt is provided: also PATCH the parent lead's followUpAt field
  - Return 201: { data: createdDiscussion }

### FILE: server/src/index.js (update)
  - Mount leads router: app.use('/api/leads', leadsRouter)
  - Mount discussions router: app.use('/api/leads', discussionsRouter)
  - Mount errorHandler as LAST middleware

### IMPORTANT RULES:
- Wrap all route handlers in try/catch and call next(error)
- Use correct HTTP status codes always
- All error responses: { error: string, details?: any }
- All success responses: { data: ... }
- Validate UUIDs before DB query (return 400 if invalid format)
```

---

### Module 2 — Validation Checklist

Test with curl or Postman/Thunder Client:

- [ ] `GET /api/leads` → returns array with lastDiscussion embedded
- [ ] `POST /api/leads` with `{ "name": "Test Lead" }` → 201, lead in response
- [ ] `POST /api/leads` with empty body → 400, error message
- [ ] `PATCH /api/leads/:id` with `{ "status": "Won" }` → 200, updated lead
- [ ] `PATCH /api/leads/invalid-uuid` → 400 or 404 (not 500)
- [ ] `GET /api/leads/:id/discussions` → array in reverse-chron order
- [ ] `POST /api/leads/:id/discussions` with `{ "note": "Test note", "followUpAt": "2025-05-15T10:00:00Z" }` → 201, and parent lead's followUpAt is updated
- [ ] `POST /api/leads/:id/discussions` with empty note → 400

### Git Commit
```bash
git add .
git commit -m "feat(api): implement leads and discussions CRUD with validation"
```

---
---

# MODULE 3 — Frontend Foundation (Store + API Layer + Utils)

**Goal:** Build the Zustand store, centralized API functions, and date utility helpers. No UI yet.

**Time estimate:** 45 minutes

---

### Cursor Composer Prompt — Module 3

```
Build the frontend data layer for LeadFlow. No UI components yet.

### FILE: client/src/api/leadApi.js

Export these async functions (use fetch(), throw errors on non-ok responses):

export async function getLeads() 
  → GET /api/leads → return data array

export async function createLead({ name, company, phone })
  → POST /api/leads → return created lead

export async function updateLead(id, patch)
  → PATCH /api/leads/:id → return updated lead

export async function getDiscussions(leadId)
  → GET /api/leads/:leadId/discussions → return array

export async function createDiscussion(leadId, { note, followUpAt })
  → POST /api/leads/:leadId/discussions → return created discussion

Each function: on response not ok, throw new Error(await response.json().error)

### FILE: client/src/utils/dateUtils.js

Export these functions using date-fns:

export function timeAgo(date)
  → formatDistanceToNow(new Date(date), { addSuffix: true })
  → e.g. "2 days ago", "just now"

export function isToday(date)
  → return true if date is same calendar day as today
  → use startOfDay and isSameDay from date-fns

export function isOverdue(date)
  → return true if date < startOfDay(today)
  → if date is null/undefined: return false

export function formatFollowUp(date)
  → if today: return "Today at " + format(date, "h:mm a")
  → if tomorrow: return "Tomorrow at " + format(date, "h:mm a")
  → else: return format(date, "MMM d 'at' h:mm a")

### FILE: client/src/store/useLeadStore.js

Use Zustand (not immer). Export default useLeadStore.

State:
  leads: []
  selectedLeadId: null
  discussions: {}   // { [leadId]: Discussion[] }
  filters: { status: 'All', search: '' }
  isLoading: false
  error: null

Actions:
  fetchLeads: async () → call getLeads(), set leads
  
  addLead: async (leadData) → call createLead(), prepend to leads array
  
  updateLead: async (id, patch) → call updateLead(), update leads[id] in place
  
  selectLead: (leadId) → set selectedLeadId (null to close dialog)
  
  fetchDiscussions: async (leadId) → if not in cache, call getDiscussions(), set discussions[leadId]
  
  addDiscussion: async (leadId, data) →
    1. call createDiscussion()
    2. prepend to discussions[leadId]
    3. update the matching lead in leads[]:
       - set lastDiscussion to the new discussion
       - if data.followUpAt: set lead.followUpAt = data.followUpAt
  
  setFilter: (key, value) → update filters[key]

Derived (computed inside component, not in store):
  filteredLeads: computed in LeadList based on filters.status and filters.search
```

---

### Module 3 — Validation Checklist

- [ ] No browser console errors when running `npm run dev`
- [ ] In browser console: `import { getLeads } from './api/leadApi'; getLeads().then(console.log)` → returns lead array
- [ ] `timeAgo(new Date())` returns "less than a minute ago"
- [ ] `isToday(new Date())` returns `true`
- [ ] `isOverdue(new Date('2020-01-01'))` returns `true`
- [ ] `isOverdue(null)` returns `false`
- [ ] Zustand store can be imported without error

### Git Commit
```bash
git add .
git commit -m "feat(store): add Zustand store, API layer, and date utilities"
```

---
---

# MODULE 4 — Lead List UI

**Goal:** Build the full main screen — header, search, status filters, lead cards, today/overdue pinning.

**Time estimate:** 1.5 hours

---

### Cursor Composer Prompt — Module 4

```
Build the main LeadFlow UI. Use the CSS variables from globals.css. Reference CONTEXT.md design system.

AESTHETIC DIRECTION:
- Dark background (#0F0F0F), warm card surfaces (#1A1A1A)
- Fonts: Import from Google Fonts — 'Sora' for headings/labels, 'IBM Plex Mono' for data/timestamps/badges
- Accent color: #D97706 (amber/ochre)
- Status colors: as defined in CONTEXT.md
- NO generic blue/white SaaS look
- Cards have a 3px left border colored by their status
- Overdue cards: bg #1F0A0A, left border #E11D48
- Today follow-up cards: pinned section with a subtle amber header label "📌 Follow-up Today"
- Hover state on cards: slight brightness lift + translateY(-1px) transition

### FILE: client/src/components/StatusBadge.jsx

Props: { status }
Renders a small pill/badge.
Map each status to its color from CONTEXT.md.
Use 'IBM Plex Mono' font. All caps. Letter-spacing.
Shape: rounded-full, px-2 py-0.5, text-xs

### FILE: client/src/components/LeadCard.jsx

Props: { lead, onClick }
Shows:
  - Lead name (Sora, font-semibold)
  - Company + phone (if present, text-secondary, IBM Plex Mono)
  - StatusBadge (top right)
  - Last note (1 line, truncated, text-tertiary)
  - Time ago of last note (IBM Plex Mono, text-xs)
  - If followUpAt is today: amber chip "Follow-up today at X:XX PM"
  - If followUpAt is overdue: red chip "Overdue: was [date]"

Left border 3px colored by status.
Card: cursor-pointer, full hover transition.

### FILE: client/src/components/LeadList.jsx

This is the main screen component.
- Header: "LeadFlow" logo (Sora, large) + "Add New Lead" button (amber, top right)
- Search bar below header: debounced 300ms, updates filters.search in store
- Status filter chips below search: All | New | Contacted | Qualified | Proposal Sent | Won | Lost
  - Active chip: amber background, dark text
  - Inactive: transparent with border
- Lead sections:
  1. "📌 Today's Follow-ups" section (if any): amber-tinted header, leads with followUpAt = today
  2. "⚠ Overdue" section (if any): red-tinted header, leads with overdue followUpAt
  3. Remaining leads sorted by updatedAt desc
- Empty state: centered illustration-free message "No leads found. Add one to get started."
- On card click: call selectLead(lead.id) from store
- Render <AddLeadModal> and <LeadDialog> here (conditional on store state)
- On mount: call fetchLeads()

### FILE: client/src/App.jsx
Just render <LeadList /> with a dark bg-[#0F0F0F] min-h-screen wrapper.
Add <Toaster> from react-hot-toast.

Import Google Fonts in index.html:
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

### Module 4 — Validation Checklist

- [ ] Dark screen loads with "LeadFlow" header
- [ ] 6 seeded leads appear in the list
- [ ] Sarah Connor appears in "Today's Follow-ups" section
- [ ] Bill Lumbergh's card has red styling (overdue)
- [ ] Status badges are correctly colored for each lead
- [ ] Clicking "New" filter shows only New leads (Dwight)
- [ ] Clicking "Won" filter shows Bruce Wayne
- [ ] Typing "sarah" in search shows only Sarah Connor
- [ ] "Add New Lead" button is visible (modal not built yet, just button)
- [ ] No console errors

### Git Commit
```bash
git add .
git commit -m "feat(ui): build LeadList with status filters, search, and pinned follow-ups"
```

---
---

# MODULE 5 — Lead Dialog (Timeline)

**Goal:** Click a lead → open the timeline dialog with full discussion history and add-note form.

**Time estimate:** 1 hour

---

### Cursor Composer Prompt — Module 5

```
Build the Lead Timeline Dialog for LeadFlow.

### FILE: client/src/components/DiscussionItem.jsx

Props: { discussion }
Shows:
  - Timestamp (IBM Plex Mono, text-xs, text-tertiary): full date + timeAgo in parens
  - Note text (text-primary)
  - If discussion has followUpAt: show amber chip "Follow-up set for: [formatFollowUp(date)]"
Layout: Timeline style — left dot connector line, entry below

### FILE: client/src/components/AddDiscussionForm.jsx

Props: { leadId, onSaved }
State: note (string), followUpDate (string), followUpTime (string), loading (bool)

Form elements:
  - Textarea: "Log a new discussion..." placeholder, min-h-[80px], dark background
  - Checkbox: "Set Follow-up" — if checked, show date + time inputs
  - Date input + Time input (side by side)
  - "Save Note" button (amber, right-aligned)

On submit:
  - Validate note not empty (show inline red error)
  - Combine followUpDate + followUpTime into ISO string if checkbox checked
  - Call store.addDiscussion(leadId, { note, followUpAt })
  - On success: clear form, call onSaved(), show toast "Note saved!"
  - On error: show toast "Failed to save note"

### FILE: client/src/components/LeadDialog.jsx

Reads selectedLeadId from store. If null, renders nothing.
On open: call fetchDiscussions(leadId).

Layout: Fixed overlay backdrop (bg-black/60 backdrop-blur-sm)
Dialog box: right-side panel OR centered modal (600px wide max)
  - bg-[#1A1A1A], rounded-xl, shadow-2xl
  - Slide-in animation: translate from right or scale from center

Dialog header:
  - Lead name (Sora, large)
  - Company + phone (IBM Plex Mono, text-secondary)
  - Status dropdown (select element styled dark, updates store.updateLead on change)
  - Close button (X icon, top right)

Dialog body:
  - Scrollable discussion history (max-h, overflow-y-auto)
  - Each discussion rendered with <DiscussionItem>
  - Loading state: spinner while fetching
  - Empty state: "No discussions yet. Log the first one below."

Dialog footer:
  - <AddDiscussionForm leadId={selectedLeadId} onSaved={() => {}} />

Pressing Escape key closes the dialog.
Clicking backdrop closes the dialog.
```

---

### Module 5 — Validation Checklist

- [ ] Clicking Sarah Connor opens the dialog
- [ ] 3 discussions appear in reverse chronological order (newest first)
- [ ] "Follow-up set for: Today at 2:00 PM" appears on the top discussion
- [ ] Status dropdown shows "Proposal Sent" selected
- [ ] Changing status to "Won" and closing dialog → Sarah's card now shows "Won" badge
- [ ] Typing a note and clicking "Save Note" → note appears at top of timeline immediately
- [ ] Saving with a follow-up date → lead card in background updates with new follow-up chip
- [ ] Saving with empty note → inline error shown, no API call made
- [ ] Pressing Escape closes dialog
- [ ] Clicking backdrop closes dialog

### Git Commit
```bash
git add .
git commit -m "feat(ui): build LeadDialog with discussion timeline and add-note form"
```

---
---

# MODULE 6 — Add New Lead Modal

**Goal:** "Add New Lead" button opens a modal. Fill name/company/phone, submit, lead appears in list.

**Time estimate:** 30 minutes

---

### Cursor Composer Prompt — Module 6

```
Build the Add New Lead modal for LeadFlow.

### FILE: client/src/components/AddLeadModal.jsx

Props: { isOpen, onClose }

If not isOpen: render nothing.

Layout: Same overlay style as LeadDialog.
  - Centered modal, max-w-md
  - Slide up or scale-in animation

Header: "Add New Lead" title + X close button

Form fields:
  - Full Name * (required) — text input, placeholder "e.g., John Doe"
    - Show red error "Name is required" if submitted empty
  - Company (Optional) — text input, placeholder "e.g., Acme Corp"
  - Phone (Optional) — text input, placeholder "e.g., 555-0123"

Buttons (bottom row):
  - "Cancel" (ghost/outline, closes modal)
  - "Save Lead" (amber, right-aligned)

On submit:
  - Validate name not empty
  - Call store.addLead({ name, company, phone })
  - On success: close modal, clear form, show toast "Lead added!"
  - On error: show toast error message

In LeadList.jsx:
  - "Add New Lead" button sets local state isAddModalOpen = true
  - Render <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
```

---

### Module 6 — Validation Checklist

- [ ] Clicking "Add New Lead" opens the modal
- [ ] Submitting empty form shows "Name is required" error
- [ ] Filling in "Test Lead" + "Test Corp" and submitting → modal closes
- [ ] "Test Lead" appears at bottom (or top) of the main list immediately
- [ ] Toast notification "Lead added!" appears
- [ ] New lead has "New" status badge

### Git Commit
```bash
git add .
git commit -m "feat(ui): build AddLeadModal with validation and store integration"
```

---
---

# MODULE 7 — Docker, README, Polish

**Goal:** Docker Compose, final README, UI polish pass, video/screenshots.

**Time estimate:** 45 minutes

---

### Cursor Composer Prompt — Module 7

```
Add Docker Compose and finalize the project.

### FILE: docker-compose.yml (at root)

version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: leadflow
      POSTGRES_PASSWORD: leadflow
      POSTGRES_DB: leadflow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build: ./server
    environment:
      DATABASE_URL: postgresql://leadflow:leadflow@db:5432/leadflow
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && node prisma/seed.js && node src/index.js"

  client:
    build: ./client
    ports:
      - "5173:5173"
    depends_on:
      - server

volumes:
  pgdata:

### FILE: server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

### FILE: client/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

### FILE: README.md (at root)

Write a clean, professional README with:
1. Project title + 1-line description
2. Screenshot placeholder: "![LeadFlow Screenshot](./screenshot.png)"
3. Tech Stack table
4. Quick Start (Local):
   - Prerequisites: Node 18+, PostgreSQL
   - Clone, copy .env.example to .env, fill values
   - cd server && npm install && npm run db:migrate && npm run db:seed && npm run dev
   - cd client && npm install && npm run dev
   - Open http://localhost:5173
5. Quick Start (Docker):
   - docker-compose up --build
   - Open http://localhost:5173
6. API Endpoints table (GET/POST/PATCH leads and discussions)
7. Features list (from PRD eval matrix)
8. Folder structure (abbreviated)
```

### UI Polish Pass (do manually in Cursor after Docker works):
- [ ] Add entrance animations: cards fade-in with staggered delay on load
- [ ] Add loading skeleton for lead list while fetching
- [ ] Ensure all inputs have consistent dark styling (no white browser defaults)
- [ ] Check mobile view: cards should stack cleanly on narrow screens
- [ ] Test all empty states

---

### Module 7 — Final Validation Checklist

- [ ] `docker-compose up --build` starts without error
- [ ] http://localhost:5173 loads in Docker
- [ ] All 6 seeded leads appear in Docker environment
- [ ] README has working setup instructions (test them fresh)
- [ ] `.env.example` has all required variables
- [ ] Git log shows meaningful commit history (all 7 modules)
- [ ] All eval matrix items checked ✅

### Final Git Commits
```bash
git add .
git commit -m "chore: add Docker Compose with Postgres, server, and client services"
git add README.md
git commit -m "docs: finalize README with local and Docker setup instructions"

# Tag the release
git tag -a v1.0.0 -m "LeadFlow v1.0.0 — Es Magico assessment submission"
git push origin main --tags
```

---
---

## Summary Table

| Module | What Gets Built | Est. Time | Commit |
|---|---|---|---|
| 0 | Project scaffold, Vite, Tailwind, Express | 30 min | `chore: scaffold` |
| 1 | Prisma schema, migration, seed data | 30 min | `feat(db): schema and seed` |
| 2 | REST API — leads + discussions | 60 min | `feat(api): CRUD endpoints` |
| 3 | Zustand store, API layer, date utils | 45 min | `feat(store): data layer` |
| 4 | Lead List UI — cards, filters, search | 90 min | `feat(ui): lead list` |
| 5 | Lead Dialog — timeline, add note | 60 min | `feat(ui): lead dialog` |
| 6 | Add New Lead modal | 30 min | `feat(ui): add lead modal` |
| 7 | Docker, README, polish | 45 min | `chore + docs` |
| **Total** | | **~6.5 hrs** | |

---

> After each module, paste the validation results here as a comment/note and confirm the git commit was made before moving forward. Good luck! 🚀