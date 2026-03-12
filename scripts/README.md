# Scripts

## Clear database

Removes **all data** from the database (users, communities, posts, comments, etc.). Table schema is kept.

**Run:**

- **Windows (PowerShell):**  
  `.\scripts\run-clear-database.ps1`

- **Linux/macOS:**  
  `bash scripts/run-clear-database.sh`

- **Manually (Docker):**  
  `docker exec -i <postgres-container-name> psql -U updog -d updog -f - < scripts/clear-database.sql`

- **Manually (local PostgreSQL):**  
  `psql -h localhost -p 5432 -U updog -d updog -f scripts/clear-database.sql`

The database must be running first (e.g. `docker compose up -d postgres`).
