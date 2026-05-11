# LeadFlow 🚀

> A single-screen Lead Management tool for sales reps — track leads, log discussions, and never miss a follow-up.

Built as a coding assessment for [Es Magico](https://esmagico.in).

---

## Screenshot

![LeadFlow Screenshot](./screenshot.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + CSS Variables |
| State | Zustand |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Container | Docker + Docker Compose |

---

## Quick Start — Local

**Prerequisites:** Node.js 18+, PostgreSQL running locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/leadflow.git
cd leadflow

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Start the backend
cd server
npm install
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed 6 leads with discussions
npm run dev              # API on http://localhost:3001

# 4. In a new terminal, start the frontend
cd client
npm install
npm run dev              # App on http://localhost:5173

# 5. Open http://localhost:5173
```

---

## Quick Start — Docker

```bash
# One command to run everything
docker-compose up --build

# Open http://localhost:5173
```

The Docker setup automatically runs migrations and seeds the database.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List all leads with last discussion |
| POST | `/api/leads` | Create a new lead |
| PATCH | `/api/leads/:id` | Update lead (status, followUpAt, etc.) |
| GET | `/api/leads/:id/discussions` | Get all discussions for a lead |
| POST | `/api/leads/:id/discussions` | Add a discussion note |

---

## Features

- ✅ Lead list with name, status badge, last note, time since last discussion
- ✅ Today's follow-ups pinned at the top
- ✅ Overdue follow-ups highlighted in red
- ✅ Filter leads by status (New / Contacted / Qualified / Proposal Sent / Won / Lost)
- ✅ Search leads by name
- ✅ Lead timeline dialog with full discussion history
- ✅ Add discussion notes with optional follow-up date & time
- ✅ Update lead status from the dialog
- ✅ Add new leads (name required; company, phone optional)
- ✅ Docker Compose setup
- ✅ Seed script with 6 leads and discussions

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/leadflow
PORT=3001
NODE_ENV=development
```

---

## Project Structure

```
leadflow/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # UI components
│       ├── store/        # Zustand state
│       ├── api/          # Fetch layer
│       └── utils/        # Date helpers
├── server/          # Express + Prisma backend
│   └── src/
│       ├── routes/       # API routes
│       ├── middleware/    # Error handling
│       └── prisma/       # Schema + seed
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Author

**Aniket Aslaliya** — [aniketaslaliya.dev](https://www.aniketaslaliya.dev) · [LinkedIn](https://www.linkedin.com/in/aniket-aslaliya/)