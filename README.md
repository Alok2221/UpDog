# UpDog – Reddit‑like community app

- **Backend (Java / Spring Boot)** – project root (`pom.xml`, `src/main/java`, `src/test/java`, `src/main/resources`)
- **Frontend (Angular)** – `frontend/`

---

## Features

- **Communities**
  - Create communities (public / private)
  - Subscribe / unsubscribe
  - Community header with name, description, banner and subscriber count

- **Posts**
  - Create posts inside a selected community
  - Post types: **TEXT**, **LINK**, **IMAGE**
  - For IMAGE posts you can:
    - add text body / caption
    - attach an image from a **URL** or **upload a file** from your device
  - Views: home (global), subreddit, feed, search results, saved posts

- **Voting & saving**
  - Upvote / downvote posts and comments
  - Exactly **one** vote per user per post/comment (clicking the same arrow again removes your vote)
  - Saved posts list

- **Comments**
  - Nested comments with reply support
  - Voting on comments

- **Auth**
  - Registration and login with JWT
  - Password reset using a reset code

---

## Running locally

### Requirements

- Java 17, Maven (backend)
- Node 20+ (frontend)
- PostgreSQL 16 (or Docker)

### Backend (from project root)

```bash
mvn spring-boot:run
```

Backend runs on:

- API: `http://localhost:8080/api`
- Default DB: PostgreSQL on `localhost:5432`, database `updog`, user/password `updog`

You can override DB connection using environment variables:

- `POSTGRES_HOST` (default `localhost`)
- `POSTGRES_PORT` (default `5432`)
- `POSTGRES_DB` (default `updog`)
- `POSTGRES_USER` (default `updog`)
- `POSTGRES_PASSWORD` (default `updog`)

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

- `http://localhost:4200`

The frontend expects the API at `http://localhost:8080/api` (configured in `frontend/src/environments/environment.ts`).

### Docker (backend + frontend + PostgreSQL)

```bash
docker compose up -d --build
```

After containers start:

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080/api`
- PostgreSQL: `localhost:5432` (`updog` / `updog`)

---

## Image uploads

- Image uploads are stored on disk (default directory: `./uploads`, configurable via `UPLOAD_DIR` or `app.upload-dir` in `application.yml`).
- Backend serves uploaded files under `http://localhost:8080/api/uploads/...`.
- The Angular app uses this URL automatically when you upload an image for a post.
