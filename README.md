<p align="center">
  <img src="midias/mixed.png" alt="The Dark Library Icon" width="250">
</p>

<div align="center"> <h1> The Dark Library</h1>

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)</div>

An atmospheric writing and reading platform designed for authors who thrive in the shadows. **The Dark Library** combines a moody, immersive aesthetic with a high-performance editor and management system.

**Live**: [the-dark-library-ldkortraps-projects.vercel.app](https://the-dark-library-ldkortraps-projects.vercel.app/)

---

## Features

- **Immersive Atmosphere**: Dark-themed UI with animated backgrounds and subtle "dust" particle effects.
- **Interactive Library**: Browse your collection with realistic book spines and generated covers.
- **Fluid Editor**: A distraction-free writing environment with autosave (2.5s debounce).
- **Reader Mode**: Comfortable reading experience tailored for long sessions.
- **Auth System**: JWT-based login with email verification and password reset.
- **Cover Management**: Book covers stored in Supabase Storage with public URLs.
- **CRUD**: Create, rename, and delete books and chapters (owner-only).

---

## Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) & [TanStack Start](https://tanstack.com/start)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deploy**: [Vercel](https://vercel.com/) (free tier)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL via connection pooler)
- **Storage**: [Supabase Storage](https://supabase.com/) (book covers)
- **Auth**: JWT (access tokens) + SMTP email verification
- **Validation**: [Zod](https://zod.dev/)
- **Deploy**: [Render](https://render.com/) (free tier)

---

## Project Structure

```text
The dark library/
├── back end/                # Node.js + Express API
│   ├── src/
│   │   ├── db/             # Database connection (Supabase pooler)
│   │   ├── modules/
│   │   │   ├── auth/       # Login, register, email verification
│   │   │   ├── books/      # CRUD de livros
│   │   │   └── chapters/   # CRUD de capítulos + autosave
│   │   └── middlewares/    # Auth (JWT) & file upload (Multer)
│   ├── setup.sql           # Schema do banco de dados
│   └── tsconfig.json
├── front end/               # React + TanStack Start
│   ├── src/
│   │   ├── components/     # UI components (EditorView, LibraryView, etc.)
│   │   ├── lib/            # API client, auth context, utils
│   │   ├── routes/         # File-based routing (TanStack)
│   │   └── hooks/          # Custom React hooks
│   └── vite.config.ts
├── render.yaml              # Blueprint para deploy no Render
└── launcher.bat             # Script para rodar frontend + backend localmente
```

---

## Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) project (free tier)

### 1. Clone
```bash
git clone https://github.com/ItaloRhide/The_Dark_Library.git
cd "The_Dark_Library"
```

### 2. Backend
```bash
cd "back end"
npm install
```
Create `.env` with:
```
DATABASE_URL=postgres://postgres.<ref>:<password>@aws-0-us-west-2.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
JWT_SECRET=<random-secret>
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
ADMIN_EMAIL=admin@darklibrary.com
ADMIN_PASSWORD=<your-password>
NODE_ENV=development
```
```bash
npm run dev
```

### 3. Frontend
```bash
cd "../front end"
npm install
```
Create `.env` with:
```
VITE_API_BASE_URL=http://localhost:3000
```
```bash
npm run dev
```

Or use the launcher:
```bash
launcher.bat
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | - | Register a new user |
| `POST` | `/auth/login` | - | Login and receive JWT |
| `POST` | `/auth/verify-email` | - | Verify email with code |
| `POST` | `/auth/forgot-password` | - | Request password reset code |
| `POST` | `/auth/reset-password` | - | Reset password with code |
| `GET` | `/books` | - | List all books |
| `POST` | `/books` | Owner | Create a new book |
| `GET` | `/books/:id` | - | Get book details + chapters |
| `PATCH` | `/books/:id` | Owner | Rename a book |
| `DELETE` | `/books/:id` | Owner | Delete a book and its chapters |
| `POST` | `/chapters` | Owner | Add a new chapter |
| `PATCH` | `/chapters/:id` | Owner | Autosave chapter content |
| `DELETE` | `/chapters/:id` | Owner | Delete a chapter |
| `POST` | `/upload/covers` | Owner | Upload a book cover |

---

## Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooler connection string |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username/email |
| `SMTP_PASS` | SMTP password/app password |
| `ADMIN_EMAIL` | Default admin email |
| `ADMIN_PASSWORD` | Default admin password |
| `NODE_ENV` | `production` or `development` |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g. `https://the-dark-library-backend.onrender.com`) |

---

## Deploy

### Vercel (Frontend)
- Connected to GitHub repo, auto-deploys on push to `master`
- Build: `npm run build`
- Output: `.output/public`

### Render (Backend)
- Web Service, auto-deploys on push to `master`
- Build: `npm install --include=dev && npm run start`
- Region: Oregon (us-west-2) for Supabase pooler compatibility

---

*Deep into that darkness peering, long I stood there, wondering, fearing, doubting, dreaming dreams no mortal ever dared to dream before.* -- **Edgar Allan Poe**
