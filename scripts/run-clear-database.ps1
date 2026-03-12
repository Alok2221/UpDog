# Uruchomienie czyszczenia bazy UpDog.
# Wymaga: działający PostgreSQL (np. docker compose up -d postgres).

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "clear-database.sql"

# Sprawdź czy działa kontener postgres (docker)
$postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" 2>$null
if ($postgresContainer) {
    Write-Host "Uruchamiam czyszczenie bazy przez Docker..."
    Get-Content $sqlFile | docker exec -i $postgresContainer psql -U updog -d updog
    if ($LASTEXITCODE -eq 0) { Write-Host "Baza wyczyszczona." } else { exit $LASTEXITCODE }
} else {
    # Lokalny psql (np. po mvn spring-boot:run z lokalnym postgresem)
    $env:PGPASSWORD = if ($env:POSTGRES_PASSWORD) { $env:POSTGRES_PASSWORD } else { "updog" }
    $host = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { "localhost" }
    $port = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5432" }
    Write-Host "Uruchamiam czyszczenie bazy (host: $host)..."
    psql -h $host -p $port -U updog -d updog -f $sqlFile
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Baza wyczyszczona."
}
