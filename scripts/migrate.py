"""
Database migration runner.

Convention
----------
Migration files live in database/migrations/ and are named like:
    0-1.sql   (version 0 → 1, the initial schema)
    1-2.sql   (version 1 → 2, adds some columns)
    2-3.sql   (version 2 → 3, adds a new table)
    ...

The script:
  1. Creates a `schema_migrations` table if it doesn't exist.
  2. Reads the current version from that table (default 0).
  3. Finds all migration files whose "from" version == current version.
  4. Applies them in order, updating the version after each one.

Usage
-----
    cd outlook-ai-copilot-saas
    python scripts/migrate.py           # apply all pending migrations
    python scripts/migrate.py --status  # just show current version, don't run
"""

import argparse
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env so DATABASE_URL is available
load_dotenv(Path(__file__).resolve().parent.parent / "backend" / ".env")

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "database" / "migrations"

CREATE_TRACKING_TABLE = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY,
    applied_at  TIMESTAMPTZ DEFAULT now(),
    filename    VARCHAR(255)
);
"""

def get_connection():
    import psycopg2
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("ERROR: DATABASE_URL is not set in backend/.env")
        sys.exit(1)
    try:
        return psycopg2.connect(database_url)
    except Exception as e:
        print(f"ERROR: Could not connect to database: {e}")
        sys.exit(1)


def get_current_version(cur) -> int:
    cur.execute("SELECT MAX(version) FROM schema_migrations;")
    row = cur.fetchone()
    return row[0] if row and row[0] is not None else 0


def get_pending_migrations(current_version: int) -> list[tuple[int, int, Path]]:
    """Return list of (from_ver, to_ver, path) sorted by from_ver."""
    pattern = re.compile(r"^(\d+)-(\d+)\.sql$")
    pending = []
    for f in MIGRATIONS_DIR.glob("*.sql"):
        m = pattern.match(f.name)
        if not m:
            print(f"  Skipping unrecognised file: {f.name}")
            continue
        from_ver, to_ver = int(m.group(1)), int(m.group(2))
        if from_ver >= current_version:
            pending.append((from_ver, to_ver, f))
    return sorted(pending, key=lambda x: x[0])


def run_migrations(status_only: bool = False):
    conn = get_connection()
    cur = conn.cursor()

    # Ensure tracking table exists
    cur.execute(CREATE_TRACKING_TABLE)
    conn.commit()

    current = get_current_version(cur)
    pending = get_pending_migrations(current)

    print(f"Current schema version : {current}")
    print(f"Migrations directory   : {MIGRATIONS_DIR}")

    if not pending:
        print("Status                 : up to date, nothing to apply")
        cur.close()
        conn.close()
        return

    print(f"Pending migrations     : {len(pending)}")
    for from_v, to_v, path in pending:
        print(f"  {path.name}  ({from_v} → {to_v})")

    if status_only:
        cur.close()
        conn.close()
        return

    print()
    for from_v, to_v, path in pending:
        print(f"Applying {path.name} ...", end=" ", flush=True)
        try:
            sql = path.read_text()
            cur.execute(sql)
            cur.execute(
                "INSERT INTO schema_migrations (version, filename) VALUES (%s, %s) "
                "ON CONFLICT (version) DO NOTHING;",
                (to_v, path.name),
            )
            conn.commit()
            print("done")
        except Exception as e:
            conn.rollback()
            print(f"FAILED\n\nERROR: {e}")
            print(f"\nStopped at {path.name}. Fix the error and re-run.")
            cur.close()
            conn.close()
            sys.exit(1)

    final = get_current_version(cur)
    print(f"\nSchema version now     : {final}")
    cur.close()
    conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run database migrations")
    parser.add_argument(
        "--status",
        action="store_true",
        help="Show current version and pending migrations without applying them",
    )
    args = parser.parse_args()
    run_migrations(status_only=args.status)
