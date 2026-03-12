#!/usr/bin/env bash
# Uruchomienie czyszczenia bazy UpDog.
# Wymaga: działający PostgreSQL (np. docker compose up -d postgres).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/clear-database.sql"

if docker ps --format '{{.Names}}' 2>/dev/null | grep -q postgres; then
  echo "Uruchamiam czyszczenie bazy przez Docker..."
  docker exec -i "$(docker ps --filter name=postgres --format '{{.Names}}' | head -1)" \
    psql -U updog -d updog < "$SQL_FILE"
  echo "Baza wyczyszczona."
else
  echo "Uruchamiam czyszczenie bazy (localhost)..."
  PGPASSWORD="${POSTGRES_PASSWORD:-updog}" psql -h "${POSTGRES_HOST:-localhost}" \
    -p "${POSTGRES_PORT:-5432}" -U updog -d updog -f "$SQL_FILE"
  echo "Baza wyczyszczona."
fi
