<p align="center">
  <img src="midias/mixed.png" alt="The Dark Library Icon" width="128">
</p>

<div align="center"> <h1>🕯️ The Dark Library 🕯️</h1>

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)</div>

An atmospheric writing and reading platform designed for authors who thrive in the shadows. **The Dark Library** combines a moody, immersive aesthetic with a high-performance editor and management system.

---

## ✨ Features

- **🌙 Immersive Atmosphere**: Dark-themed UI with animated backgrounds and subtle "dust" particle effects.
- **📚 Interactive Library**: Browse your collection with realistic book spines and covers.
- **✍️ Fluid Editor**: A distraction-free writing environment with optimized autosave functionality.
- **📖 Reader Mode**: Comfortable reading experience tailored for long sessions.
- **🚀 High Performance**: Built with TanStack Start/Router for lightning-fast navigation and Postgres for robust data persistence.
- **🖼️ Cover Management**: Easy book cover uploads and organization.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router) & [TanStack Start](https://tanstack.com/start)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (inferred) / CSS Animations

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## 📂 Project Structure

```text
The dark library/
├── back end/            # Node.js + Express API
│   ├── src/
│   │   ├── db/          # Database connection & scripts
│   │   ├── modules/     # Books and Chapters logic
│   │   ├── middlewares/ # Upload & Auth logic
│   │   └── utils/       # Logger and helpers
│   └── uploads/         # Book cover storage
└── front end/           # React + TanStack application
    ├── src/
    │   ├── components/  # Thematic UI components
    │   ├── lib/         # API clients and utils
    │   └── routes/      # File-based routing (TanStack)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/the-dark-library.git
cd "the-dark-library"
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd "back end"
   npm install
   ```
2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL credentials.
3. Initialize the database:
   - Run the contents of `setup.sql` in your PostgreSQL instance.
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../"front end"
   npm install
   ```
2. Configure environment variables:
   - Create a `.env` file (based on `.env.example`).
   - Set `VITE_API_BASE_URL=http://localhost:3000` (or your backend URL).
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/books` | List all books |
| `POST` | `/books` | Create a new book |
| `GET` | `/books/:id` | Get book details & chapters |
| `PATCH` | `/chapters/:id` | Autosave chapter content |
| `POST` | `/chapters` | Add a new chapter |
| `DELETE` | `/books/:id` | Remove a book |

---

## 🎨 Visual Identity

The project uses a dark, monochromatic palette with deep grays and gold/sepia accents to evoke a Victorian library feel.
- **Dust Component**: Simulates floating particles in a dimly lit room.
- **BookSpine**: Generates unique visual identifiers for books in the library view.

---

## 📜 License
This project is licensed under the **ISC License**. See the `LICENSE` file for details (if available).

---

*“Deep into that darkness peering, long I stood there, wondering, fearing, doubting, dreaming dreams no mortal ever dared to dream before.”* — **Edgar Allan Poe**
