# Outlook AI Copilot SaaS

An AI-powered email copilot that runs as an Outlook task-pane add-in. It reads the current email, summarizes the thread, looks up customer context, and generates professional reply drafts — all inside Outlook.

## Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React + Vite + Office.js (add-in) |
| Backend     | FastAPI (Python)                  |
| Database    | PostgreSQL on Supabase            |
| Auth        | Supabase Auth (magic link)        |
| AI          | OpenAI API                        |
| Hosting     | Render (backend) + Supabase (DB)  |

## Project Structure

```
outlook-ai-copilot-saas/
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/      # Route handlers and dependencies
│   │   ├── core/     # Config, database, security
│   │   ├── models/   # SQLAlchemy ORM models
│   │   ├── schemas/  # Pydantic request/response schemas
│   │   ├── services/ # Business logic (AI, customers, auth)
│   │   └── prompts/  # AI prompt templates
│   └── tests/
├── addin/            # Outlook add-in (React + Vite)
│   ├── src/
│   │   ├── taskpane/ # Task pane UI components
│   │   ├── auth/     # Login flow
│   │   ├── services/ # API client, Office.js helpers
│   │   ├── hooks/    # React hooks
│   │   └── types/    # TypeScript type definitions
│   └── manifest.xml  # Outlook add-in manifest
├── database/         # SQL schemas and seed data
│   ├── migrations/
│   └── seeds/
├── scripts/          # Dev utility scripts
├── docs/             # Architecture documentation
└── render.yaml       # Render deployment config
```

## MVP Milestones

1. **Add-in shell** — Sideload manifest, verify task pane loads in Outlook
2. **Read email** — Fetch subject, sender, body via Office.js
3. **Backend API** — FastAPI with health check and mock draft endpoint
4. **Auth** — Supabase magic link login
5. **Data model** — Tenant/user/customer tables with seed data
6. **AI integration** — OpenAI summary + draft generation
7. **Logging** — Save drafts and interaction history
8. **UX polish** — Copy, regenerate, save draft buttons
9. **Deploy** — Backend on Render, connected to Supabase
10. **SaaS polish** — Branding, rate limits, settings

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your keys
uvicorn main:app --reload --port 8000
```

### Add-in

```bash
cd addin
npm install
npm run dev
# Sideload manifest.xml in Outlook to test
```

## Environment Variables

See `.env.example` at the project root for all required configuration.

## License

Proprietary — all rights reserved.
