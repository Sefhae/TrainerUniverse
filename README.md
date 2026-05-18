# FitConnect

A full-stack personal trainer marketplace. Browse elite coaches, filter by specialty,
price and availability, view rich profiles with transformation galleries and reviews —
and, as a trainer, manage your own listing from a dedicated dashboard.

The design language is luxury/athletic: near-black surfaces, an electric-lime accent,
Bebas Neue display type over DM Sans, sharp corners and high-contrast editorial layouts.

## Tech stack

- **Frontend** — React + TypeScript + Vite, Tailwind CSS, React Router v6, Lucide icons
- **Backend** — Node.js + Express
- **Database** — SQLite via `better-sqlite3` (created and seeded automatically)
- **Auth** — JWT-based authentication for trainers
- **Uploads** — Multer, stored locally in `server/uploads/`

## Prerequisites

- Node.js 18 or newer (developed and tested on Node 22)

## Setup

From the project root, install dependencies for the root, server and client:

```bash
npm run install:all
```

## Running the app

```bash
npm run dev
```

This starts both processes together:

- **Web app** → http://localhost:5173
- **API** → http://localhost:4000

The Vite dev server proxies `/api` and `/uploads` to the backend, so you only need to
open the web app. On first launch the SQLite database is created and seeded with sample
data automatically.

## Demo trainer account

Log in at `/login` to explore the trainer dashboard:

- **Email** — `marcus@fitconnect.com`
- **Password** — `trainer123`

All eight seeded trainers share the password `trainer123` (e.g. `sofia@fitconnect.com`,
`darnell@fitconnect.com`). You can also register a brand-new trainer account.

## Scripts

Run from the project root:

| Command | Description |
| --- | --- |
| `npm run dev` | Run the client and server together |
| `npm run seed` | Reset and re-seed the database |
| `npm run build` | Build the client for production |
| `npm run install:all` | Install dependencies for root, server and client |

## Project structure

```
fitconnect/
├── client/                 React + TypeScript frontend
│   └── src/
│       ├── components/     Shared UI + dashboard components
│       ├── pages/          Home, Directory, TrainerProfile, Login, Register, Dashboard
│       ├── hooks/          useAuth, useTrainers, useToast
│       ├── api/            Axios client
│       └── lib/            Helpers and constants
├── server/                 Express backend
│   ├── routes/             auth, trainers, packages, work, reviews
│   ├── middleware/         JWT auth, Multer upload
│   ├── db/                 SQLite connection + schema + seed data
│   └── uploads/            Locally stored image uploads
└── package.json            Root scripts (runs both via concurrently)
```

## API overview

Auth
- `POST /api/auth/register` — register a trainer
- `POST /api/auth/login` — log in
- `GET  /api/auth/me` — current account

Trainers
- `GET  /api/trainers` — list with filter & sort query params
- `GET  /api/trainers/:id` — full public profile
- `PUT  /api/trainers/:id` — update profile *(owner only)*
- `POST /api/trainers/:id/photos` — upload profile/cover photos *(owner only)*

Packages / Previous Work
- `GET/POST/PUT/DELETE /api/trainers/:id/packages`
- `GET/POST/PUT/DELETE /api/trainers/:id/work`

Reviews
- `GET  /api/trainers/:id/reviews`
- `POST /api/trainers/:id/reviews` — public, no account required

## Notes

- Seed trainer photos use external placeholder services; uploaded images are saved to
  `server/uploads/` and served from `/uploads`.
- The JWT secret defaults to a development value — set `JWT_SECRET` in the environment
  for any real deployment.
