#!/usr/bin/env bash
# Local development setup script
set -e

echo "=== Outlook AI Copilot — Local Setup ==="

# Backend
echo ""
echo "--- Setting up backend ---"
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created backend/.env — fill in your keys before running."
fi
cd ..

# Add-in
echo ""
echo "--- Setting up add-in ---"
cd addin
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created addin/.env — fill in your keys before running."
fi
cd ..

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Fill in backend/.env and addin/.env with your Supabase + OpenAI keys"
echo "  2. Run the database migration: database/migrations/001_initial_schema.sql in Supabase SQL editor"
echo "  3. Seed demo data: python scripts/seed_db.py"
echo "  4. Start backend: cd backend && source .venv/bin/activate && uvicorn main:app --reload"
echo "  5. Start add-in: cd addin && npm run dev"
echo "  6. Sideload addin/manifest.xml in Outlook"
