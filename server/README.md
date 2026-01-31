# Server

Express + Better Auth API backed by PostgreSQL (Prisma). Provides auth endpoints at `/api/auth/*` and a session helper at `/api/me`.

## Requirements

- Bun $\ge 1.3$
- PostgreSQL $\ge 14$
- Resend account (for OTP emails)
- OAuth apps (optional): GitHub, Google

## Setup

### 1) Install dependencies

```bash
bun install
```

### 2) Configure environment variables

Create a `.env` file in the **same folder you run Bun from** (Bun loads env from the current working directory). If you run from the repo root, keep `.env` in the repo root. If you run from `server/`, place `.env` inside `server/`.

**Required**

- `DATABASE_URL` – PostgreSQL connection string.
- `BACKEND_URL` – public URL for this API (default `http://localhost:3005`).
- `FRONTEND_URL` – frontend origin used by Better Auth trusted origins (default `http://localhost:3000`).
- `RESEND_API_KEY` – Resend API key.
- `EMAIL_FROM` – From address for OTP emails.
- `APP_NAME` – Display name for emails.

**Optional (OAuth)**

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Example:

```
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
BACKEND_URL=http://localhost:3005
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=your_resend_key
EMAIL_FROM=onboarding@resend.dev
APP_NAME=Your App Name
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3) Prisma generate + migrate

```bash
bunx prisma generate
bunx prisma migrate dev
```

### 4) Run the server

```bash
bun run index.ts
```

Server listens on `http://localhost:3005`.

## Frontend auth client (required)

Install the client package in your frontend and create a small helper that points to this API. Example (`src/authClient.ts`):

```ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3005",
	basePath: "/api/auth",
	credentials: "include",
});
```

Notes:

- If you’re using Next.js, use `process.env.NEXT_PUBLIC_BACKEND_URL` instead of `import.meta.env.*`.
- CORS in the server is currently hardcoded to `http://localhost:3000`. Update it in [src/index.ts](src/index.ts#L6) if your frontend runs elsewhere.
- OTP verification emails are sent via Resend using `EMAIL_FROM`.

## Useful endpoints

- `GET /api/me` – returns the current session (if logged in)
- `POST /api/auth/*` – Better Auth endpoints (login, signup, verify, etc.)

## Tech stack

- Bun
- Express
- Better Auth
- Prisma + PostgreSQL

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
