# ReplyGenie

**Save hours on email — AI that reads, summarizes, and writes replies directly inside Outlook.**

ReplyGenie is a production-ready Outlook add-in that sits inside your email client, reads the current thread, looks up customer context, and generates professional reply drafts using OpenAI — without ever leaving Outlook.

[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)](https://openai.com)

---

## Live Demo

**Frontend:** [email-ai-assistant-ochre.vercel.app](https://email-ai-assistant-ochre.vercel.app)

**Video walkthrough:** [Watch Demo](https://your-loom-link-here) *(replace with your Loom link)*

> To try it inside Outlook, see [Sideloading the Add-in](#sideloading-the-add-in) below.

---

## Features

- ✉️ Automatically summarizes long email threads so you know what matters
- 🤖 Generates professional, context-aware reply drafts in one click
- 👤 Pulls customer context (segment, tone preference, account notes) for personalized responses
- ⚡ Works directly inside Outlook — no tab switching, no copy-pasting
- 🔐 Secure OTP login via Supabase Auth (magic link, no passwords)
- 🏢 Multi-tenant SaaS architecture — each organization's data is fully isolated
- 📜 Draft history — every generated reply is saved and retrievable
- 🚀 Fully deployed — backend on Render, frontend on Vercel, database on Supabase

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Outlook Client                      │
│  ┌───────────────────────────────────────────────┐  │
│  │         Task Pane (React + Office.js)          │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────┐  │  │
│  │  │  Login   │ │  Email   │ │  Draft Reply  │  │  │
│  │  │  Screen  │ │  Summary │ │  + Actions    │  │  │
│  │  └─────────┘ └──────────┘ └───────────────┘  │  │
│  └──────────────────┬────────────────────────────┘  │
└─────────────────────┼───────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend (Render)                │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │  Routes   │ │  Services  │ │  Prompt Builder  │  │
│  │  /health  │ │  ai_svc    │ │  templates.py    │  │
│  │  /drafts  │ │  cust_repo │ │                  │  │
│  │  /auth    │ │  auth_svc  │ │                  │  │
│  └──────────┘ └────────────┘ └──────────────────┘  │
└────────┬──────────────┬──────────────┬──────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │ │   OpenAI     │ │  Graph API   │
│   Postgres   │ │   API        │ │  (future)    │
│   + Auth     │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

Designed for scalability, security, and multi-tenant SaaS deployments.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Office.js (Outlook add-in) |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (OTP / magic link) |
| AI | OpenAI GPT-4o-mini |
| Hosting | Render (backend) + Vercel (frontend) + Supabase (DB) |

Deployed on Render + Vercel + Supabase — production-ready, zero-downtime deploys on every push.

---

## Use Cases

- **Customer support teams** handling high email volume who need fast, consistent replies
- **Sales teams** drafting client responses quickly without losing the personal touch
- **Founders** automating inbox workflows to reclaim time
- **SaaS products** looking to integrate AI-powered email assistance for their users

---

## Project Structure

```
replygenie/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/routes/   # Auth, drafts, customers, email events
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # AI, customer lookup, auth logic
│   │   └── prompts/      # OpenAI prompt templates
│   └── main.py
├── addin/                # Outlook add-in (React + Vite)
│   ├── src/
│   │   ├── taskpane/     # Task pane UI components
│   │   ├── auth/         # OTP login flow
│   │   ├── services/     # API client, Supabase client
│   │   ├── hooks/        # useAuth, useOffice
│   │   └── types/        # TypeScript definitions
│   └── manifest.xml      # Outlook add-in manifest
├── database/             # SQL migrations and seed data
├── docs/                 # Architecture documentation
└── render.yaml           # Render deployment config
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 1. Clone the repo

```bash
git clone https://github.com/ahmedawesome11/outlook-ai-copilot-saas.git
cd outlook-ai-copilot-saas
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in your keys (see below)
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`. Confirm with `http://localhost:8000/health`.

### 3. Frontend (add-in) setup

```bash
cd addin
npm install
cp .env.example .env             # then fill in your keys (see below)
npm run dev
```

The add-in dev server starts at `https://localhost:3000` (HTTPS is required by Outlook).

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `APP_ENV` | `development` or `production` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `DATABASE_URL` | Full PostgreSQL connection string from Supabase |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use, e.g. `gpt-4o-mini` |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins |

### `addin/.env`

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_API_URL` | Backend URL, e.g. `http://localhost:8000` |

---

## Sideloading the Add-in

To try ReplyGenie inside your own Outlook, sideload the manifest manually — no app store required.

### Outlook on the web (outlook.live.com or outlook.office365.com)

1. Open Outlook in your browser and go to **Settings** (gear icon, top right)
2. Search for **"Add-ins"** and open **Manage add-ins**
3. Click **"My add-ins"** → **"Add a custom add-in"** → **"Add from file..."**
4. Upload `addin/manifest.xml` from this repo
5. Open any email — you will see an **"Open Copilot"** button in the ribbon

### Outlook desktop (Windows / Mac)

1. Open Outlook desktop and go to **Home** tab
2. Click **Get Add-ins** (or **Store**)
3. Go to **My Add-ins** → **Custom Add-ins** → **"+ Add a custom add-in"** → **"Add from file..."**
4. Upload `addin/manifest.xml`
5. Open any email — click **"Open Copilot"** in the ribbon

> **Note:** The manifest currently points to the live Vercel deployment, so the add-in will load without needing to run anything locally.

---

## Roadmap

| # | Milestone | Status |
|---|-----------|--------|
| 1 | **Add-in shell** — Sideload manifest, verify task pane loads in Outlook | ✅ Done |
| 2 | **Read email** — Fetch subject, sender, body via Office.js | ✅ Done |
| 3 | **Backend API** — FastAPI with health check and draft endpoint | ✅ Done |
| 4 | **Auth** — Supabase OTP login, JWT verification, user auto-provision | ✅ Done |
| 5 | **Data model** — Tenant/user/customer tables with seed data | ✅ Done |
| 6 | **AI integration** — OpenAI summary + draft generation | ✅ Done |
| 7 | **Logging** — Save email events and draft history to database | ✅ Done |
| 8 | **UX polish** — Copy, regenerate, tone selector, loading states | ✅ Done |
| 9 | **Deploy** — Backend on Render, production Supabase, HTTPS manifest | ✅ Done |
| 10 | **SaaS polish** — Branding, settings page, usage dashboard | 🔲 Upcoming |

### Why not Microsoft SSO?

We evaluated Office.js `getAccessToken()` to replace Supabase OTP with seamless single sign-on using the user's Outlook account. It was not adopted because:

- **Personal accounts:** `getAccessToken()` does not work on `outlook.live.com` (personal Outlook in the browser); it only works on Outlook desktop and `outlook.office365.com` (work/school accounts).
- **Tenant consent:** Work/school tenants often require admin consent (AADSTS500011), which adds friction for B2B deployments.
- **Platform limits:** The add-in runs across personal and work accounts; Supabase OTP provides a consistent, reliable auth flow for all users without requiring Azure AD configuration.

---

## Work With Me

I build custom AI-powered tools like this for businesses.

If you're looking to automate workflows, build AI assistants, or integrate LLMs into your product — feel free to reach out.

**GitHub:** [github.com/ahmedawesome11](https://github.com/ahmedawesome11)

---

## License

Proprietary — all rights reserved.
