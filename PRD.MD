# LeadFlow — Product Requirements Document

> **Assignment:** Es Magico Fullstack AI Intern — Coding Assessment  
> **Deadline:** 4 working days from May 7, 2025  
> **Estimated Build Time:** 6–8 hours  
> **Owner:** Aniket Aslaliya

---

## 1. Product Overview

**LeadFlow** is a single-screen Lead Management tool (lightweight CRM) designed for sales reps to:
- Track leads through a pipeline
- Log discussions/notes against each lead
- Set and manage follow-up reminders

The entire experience lives on **one screen** with dialogs — no page navigation.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 + custom CSS variables |
| State Management | Zustand (lightweight, no boilerplate) |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Container | Docker + Docker Compose |
| API Format | REST + JSON |
| Date Utilities | date-fns |
| Icons | Lucide React |
| Notifications | react-hot-toast |

---

## 3. Data Models

### Lead
```
id            UUID (PK)
name          String (required)
company       String? (optional)
phone         String? (optional)
status        Enum: New | Contacted | Qualified | Proposal Sent | Won | Lost
followUpAt    DateTime? (next scheduled follow-up)
createdAt     DateTime
updatedAt     DateTime
```

### Discussion
```
id            UUID (PK)
leadId        UUID (FK → Lead)
note          String (required)
followUpAt    DateTime? (set a future follow-up from this entry)
createdAt     DateTime
```

---

## 4. Feature Requirements

### 4.1 Lead List (Main Screen)

| Requirement | Detail |
|---|---|
| Show each lead | Name, status badge, last discussion note, time since last discussion |
| Status filter | Tabs/chips: All / New / Contacted / Qualified / Proposal Sent / Won / Lost |
| Today's follow-ups | Pinned at the top of the list with a visual indicator |
| Overdue follow-ups | Highlighted in red (bonus) |
| Search | Search leads by name (bonus) |
| Empty states | Friendly message when no leads match filter/search |

### 4.2 Lead Timeline Dialog

| Requirement | Detail |
|---|---|
| Trigger | Click anywhere on a lead card |
| Layout | Dialog/modal overlay (NOT a new page) |
| Discussion history | Reverse chronological order (newest first) |
| Add note form | Textarea for note + optional follow-up date & time |
| Saving behavior | Saving with a follow-up date updates lead's `followUpAt` field |
| Immediate reflection | List updates without page reload |
| Status update | Dropdown inside dialog to change lead status |

### 4.3 Add New Lead Modal

| Requirement | Detail |
|---|---|
| Trigger | "Add New Lead" button (top right) |
| Fields | Full Name (required), Company (optional), Phone (optional) |
| Default status | New |
| Validation | Name is required; show inline error |
| Success | Lead appears in list immediately |

---

## 5. API Endpoints

### Leads
```
GET    /api/leads              → List all leads (with last discussion)
POST   /api/leads              → Create new lead
PATCH  /api/leads/:id          → Update lead (status, followUpAt)
DELETE /api/leads/:id          → Delete lead (optional)
```

### Discussions
```
GET    /api/leads/:id/discussions   → Get all discussions for a lead
POST   /api/leads/:id/discussions   → Add a new discussion note
```

### Response Codes
```
200 OK           → Successful GET / PATCH
201 Created      → Successful POST
400 Bad Request  → Validation failure (with error message)
404 Not Found    → Lead/discussion doesn't exist
500 Internal     → Unhandled server error
```

---

## 6. UI/UX Design Direction

### Aesthetic: "Refined Utilitarian"
- **NOT** generic SaaS blue. NOT purple gradients.
- Color palette: Near-black (`#0F0F0F`) backgrounds, warm off-white (`#F5F0E8`) cards, accent in deep amber/ochre (`#D97706`) for CTAs and highlights.
- Typography: `DM Mono` or `IBM Plex Mono` for data/badges, `Fraunces` or `Sora` for headings. Feels like a Bloomberg terminal crossed with a Notion doc.
- Status badges: Each status has a distinct muted color (not neon). Pill shape, small, dense.
- Cards: Subtle left-border accent color matching status. Hover lifts the card with a `box-shadow` transition.
- Overdue indicators: Soft red left border + red text, not jarring.
- Follow-up pins: Amber/gold chip at top of list, not a banner.
- Dialogs: Slide-in from right or center with a subtle backdrop blur, not a hard overlay.
- Animations: Staggered card entrance on load, smooth dialog transitions, toast notifications for success/error actions.

### Status Color Map
```
New           → Slate blue   (#64748B)
Contacted     → Indigo       (#6366F1)
Qualified     → Teal         (#0D9488)
Proposal Sent → Amber        (#D97706)
Won           → Emerald      (#059669)
Lost          → Rose         (#E11D48)
```

---

## 7. Seed Data (Required: 5+ Leads)

| Name | Company | Status | Notes |
|---|---|---|---|
| Sarah Connor | Acme Corp | Proposal Sent | Sent pricing PDF, awaiting review |
| Hank Scorpio | Globex Inc | Qualified | Budget approved, needs legal sign-off |
| Bill Lumbergh | Initech | Contacted | Left voicemail, follow-up needed |
| Bruce Wayne | Wayne Enterprises | Won | Contract signed! |
| Dwight Schrute | Dunder Mifflin | New | Inbound from website form |
| Regina George | Plastics Inc | Lost | Went with competitor |

Each lead should have 2–3 discussion entries with varied timestamps.

---

## 8. Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/leadflow
PORT=3001
NODE_ENV=development
```

---

## 9. Evaluation Matrix Mapping

| Criteria | Implementation |
|---|---|
| Lead list shows name, status, last note, time ago | ✅ LeadCard component |
| Today's follow-ups pinned | ✅ Sorted + pinned section |
| Timeline dialog loads in order | ✅ Reverse-chron sort |
| Adding a discussion updates list | ✅ Zustand store update |
| Add new lead works | ✅ Modal + POST /api/leads |
| Status update persists | ✅ PATCH /api/leads/:id |
| Clean component structure | ✅ Feature-folder structure |
| API correct status codes + error handling | ✅ Express middleware |
| README with setup | ✅ README.md |
| Meaningful git commits | ✅ Per-module commits |
| Search leads by name | ✅ Bonus |
| Overdue follow-ups in red | ✅ Bonus |
| Docker Compose | ✅ Bonus |
| Seed script | ✅ Bonus |