"""Seed the Supabase database with demo data.

Usage:
    cd backend
    python -m scripts.seed_db

Or from project root:
    python scripts/seed_db.py
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")


def seed():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL not set. Copy backend/.env.example to backend/.env and fill in your values.")
        return

    sql_file = Path(__file__).resolve().parent.parent / "database" / "seeds" / "demo_data.sql"
    if not sql_file.exists():
        print(f"ERROR: Seed file not found at {sql_file}")
        return

    try:
        import psycopg2

        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        cur.execute(sql_file.read_text())
        conn.commit()
        cur.close()
        conn.close()
        print("Seed data inserted successfully.")
    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    seed()
