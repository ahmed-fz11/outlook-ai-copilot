# Architecture Overview

## System Layers

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
│              FastAPI Backend (Render)                 │
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

## Data Flow — Draft Generation

1. User opens an email in Outlook
2. Add-in reads subject, sender, body via Office.js
3. User clicks "Generate Draft"
4. Add-in POSTs email context to `/api/drafts/generate`
5. Backend authenticates user via Supabase JWT
6. Backend looks up customer by sender email/domain
7. Backend builds prompt from email + customer context + business rules
8. Backend calls OpenAI, receives structured JSON
9. Backend saves EmailEvent + Draft to Postgres
10. Backend returns summary + draft + missing info to add-in
11. User reviews, copies, or regenerates

## Multi-Tenancy

Every major table carries `tenant_id`. The user is always resolved to a
tenant on login. All queries are scoped to the tenant. This supports:

- Multiple companies using the same deployment
- Future white-labeling per tenant
- Tenant-specific prompt configs and business rules

## Auth Flow (MVP)

1. User enters email in the add-in login screen
2. Supabase sends a magic link to their inbox
3. User clicks the link, Supabase creates a session
4. Add-in stores the access token
5. All API calls include the token as a Bearer header
6. Backend validates the token via Supabase Auth, resolves the app user

## Future: Microsoft Graph Integration

The `mail_provider.py` service is a placeholder. When Graph is added:

- Users will authenticate with Microsoft OAuth
- Backend will fetch full thread history from the mailbox
- Backend can create draft replies directly in the user's mailbox
- This replaces the "Copy Draft" flow with native Outlook integration
