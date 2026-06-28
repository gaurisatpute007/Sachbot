# SachBot — AI-Powered Misinformation Detection
> Team: The Trial Blazers — Harish M · Gauri Anil Satpute · Gokul R

---

## Quick start

### 1. Backend (FastAPI + Gemini)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and paste your Gemini API key:
#   GEMINI_API_KEY=AIza...

uvicorn app.main:app --reload --port 8000
```

API docs → http://localhost:8000/docs

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App → http://localhost:5173

---

## Get a free Gemini API key

1. Go to **aistudio.google.com**
2. Sign in with any Google account
3. Click **Get API key → Create API key**
4. Paste it into `backend/.env` as `GEMINI_API_KEY=...`

Free tier: 15 req/min · 1M tokens/day — plenty for a hackathon demo.

---

## Project structure

```
sachbot/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + CORS
│   │   ├── routers/
│   │   │   ├── verify.py         # Gemini claim check + pipeline
│   │   │   ├── dashboard.py      # Stats, alerts, trends
│   │   │   ├── queue.py          # Review queue + resolve
│   │   │   └── webhook.py        # WhatsApp webhook handler
│   │   └── models/
│   │       └── store.py          # In-memory DB (swap for PostgreSQL)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── CitizenBot.jsx    # WhatsApp-style chat UI
        │   ├── Pipeline.jsx      # Animated step-by-step pipeline
        │   ├── Dashboard.jsx     # NGO stats, charts, alerts
        │   └── ReviewQueue.jsx   # Human review with actions
        ├── components/
        │   ├── Layout.jsx        # Sidebar nav
        │   └── ui.jsx            # Shared components
        └── lib/api.js            # Axios API client
```

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/verify/check` | Submit claim → Gemini → verdict |
| GET  | `/api/verify/pipeline/:id` | Pipeline steps for a claim |
| GET  | `/api/dashboard/stats` | Summary counts |
| GET  | `/api/dashboard/alerts` | Early warning alerts |
| GET  | `/api/dashboard/trends` | District + category breakdowns |
| GET  | `/api/queue` | Pending review items |
| POST | `/api/queue/:id/resolve` | Resolve with verdict |
| GET/POST | `/api/webhook/whatsapp` | WhatsApp Business webhook |

---

## Deploy

**Backend** (Render/Railway free tier):
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env var: `GEMINI_API_KEY`

**Frontend** (Vercel):
- Build: `npm run build` → deploy `dist/`
- Env var: update `vite.config.js` proxy to point at deployed backend URL
