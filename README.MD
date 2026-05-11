# LeadFlow

> A single-screen lead management app for sales reps: track leads, log discussions, and stay on top of follow-ups.

Built as a coding assessment for [Es Magico](https://esmagico.in).

---

## Screenshot

![LeadFlow Screenshot](./screenshot.png)

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
- Status filters and name search
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
