# LeadFlow

> A single-screen lead management app for sales reps: track leads, log discussions, and stay on top of follow-ups.

Built as a coding assessment for [Es Magico](https://esmagico.in).

---

## Submission checklist (evaluation matrix)

| Requirement | How it is met |
| --- | --- |
| **Lead list:** name, status badge, last note, time since last discussion | `LeadCard.jsx` + list from `GET /api/leads` (last discussion embedded server-side). |
| **Filter by status** | Chips in `LeadList.jsx`; statuses match Prisma enum (`New` … `Lost`; UI label maps `ProposalSent` → “Proposal Sent”). |
| **Today’s follow-ups pinned** | Top section “Today’s follow-ups” in `LeadList.jsx`, sorted by follow-up time. |
| **Timeline dialog** | `LeadDialog.jsx` modal (not a route); discussions from `GET /api/leads/:id/discussions` **newest first**. |
| **Add discussion + optional follow-up** | `AddDiscussionForm.jsx` → `POST /api/leads/:id/discussions`; transaction updates `Lead.followUpAt` when a follow-up is set. |
| **List updates immediately** | `useLeadStore.addDiscussion` updates `leads` and `discussions` in memory. |
| **Add new lead** | `AddLeadModal.jsx` → `POST /api/leads` (name required; company/phone optional; status defaults **New** on server). |
| **Status update persists** | Dialog `select` → `PATCH /api/leads/:id`; store merges response into `leads`. |
| **Search** | Debounced search by **name, company, or phone** (`LeadList.jsx`). |
| **Overdue highlighted** | “Overdue” section + red-tinted card chrome in `LeadCard.jsx`. |
| **Docker Compose** | Root `docker-compose.yml`: Postgres, API (migrate + seed + server), Vite client with `VITE_API_PROXY`. |
| **Seed** | `server/prisma/seed.js`: **6** leads, each with at least one discussion. |
| **API shape & errors** | JSON `{ data }` / `{ error, details? }`; `400` validation, `404` not found, `500` fallback in `errorHandler.js`. |

**Demo asset for reviewers:** add **`screenshot.png`** at the repo root and embed it here, or link a short screen recording in your submission email. (The image file is intentionally not committed so you can attach your own capture.)

**Use of AI:** Parts of this project were developed with AI coding assistance (scaffolding, UI polish, and documentation). All behavior was reviewed and verified against the spec above; inspect `git log` for incremental, reviewable commits.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v3 + CSS variables |
| State | Zustand |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Container | Docker + Docker Compose |

---

## Quick Start — Local

**Prerequisites:** Node.js 18+ and a running PostgreSQL instance (or use Docker-only flow below).

```bash
git clone https://github.com/AniketAslaliya/LeadFlow.git
cd LeadFlow

cp .env.example .env
# Set DATABASE_URL to your Postgres connection string (see .env.example).

cd server
npm install
npm run db:migrate -- --name init   # first run, or: npm run db:migrate after schema changes
npm run db:seed
npm run dev                          # API → http://localhost:3001

# New terminal
cd client
npm install
npm run dev                          # App → http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to `http://localhost:3001`.

---

## Quick Start — Docker

From the repo root:

```bash
docker compose up --build
```

Then open **http://localhost:5173**. Compose brings up Postgres, runs **`prisma migrate deploy`**, seeds six leads, and starts the API and Vite dev server. The client container uses **`VITE_API_PROXY=http://server:3001`** so API calls from the browser are proxied correctly inside the stack.

If port **5432** is already used on your machine, stop the other Postgres service or change the host mapping in `docker-compose.yml`.

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/leads` | List leads with last discussion summary |
| POST | `/api/leads` | Create a lead |
| PATCH | `/api/leads/:id` | Update lead fields |
| DELETE | `/api/leads/:id` | Delete a lead (optional / bonus) |
| GET | `/api/leads/:id/discussions` | List discussions (newest first) |
| POST | `/api/leads/:id/discussions` | Add a discussion; optional `followUpAt` updates the lead |

Success responses use `{ "data": ... }`. Errors use `{ "error": "...", "details"?: ... }`.

---

## Features

- Lead list with status, last note, and time since last activity
- Today’s follow-ups grouped at the top; overdue highlighted
- Status filters and search (name, company, or phone)
- Timeline dialog: discussions, add note + follow-up, change status
- Add new lead modal
- Docker Compose for Postgres + API + client
- Prisma seed with six sample leads

---

## Environment Variables

See **`.env.example`**. At minimum:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/leadflow
PORT=3001
NODE_ENV=development
```

For **Docker** (or pointing the Vite dev proxy at another API host), set optional **`VITE_API_PROXY`** (see comments in `.env.example`).

---

## Project Structure

```
LeadFlow/
├── client/                 # React + Vite
│   ├── Dockerfile
│   └── src/
│       ├── components/
│       ├── store/
│       ├── api/
│       ├── utils/
│       └── styles/
├── server/                 # Express + Prisma
│   ├── Dockerfile
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── lib/
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.js
│       └── migrations/
├── docker-compose.yml
├── .env.example
├── README.MD
├── PRD.MD
├── CONTEXT.MD
└── ROADMAP.MD
```

---

## Author

**Aniket Aslaliya** — [aniketaslaliya.dev](https://www.aniketaslaliya.dev) · [LinkedIn](https://www.linkedin.com/in/aniket-aslaliya/)
