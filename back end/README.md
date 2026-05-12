# The Dark Library Backend (Minimal)

A clean, production-ready backend for a writing platform built with Node.js, Express, and raw PostgreSQL.

## Tech Stack
- Node.js
- TypeScript
- Express.js
- PostgreSQL (via `pg`)
- Zod (validation)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Database Setup**:
   - Create a database named `dark_library` in PostgreSQL.
   - Run the SQL script found in `setup.sql` to create tables and indexes.

3. **Configure Environment**:
   - Check the `.env` file and ensure `DATABASE_URL` matches your local PostgreSQL credentials.

4. **Run the Server**:
   ```bash
   # development
   npm run dev

   # production
   npm run build
   npm run start
   ```

## API Features

### Autosave Optimization
The `PATCH /chapters/:id` endpoint is designed to be extremely fast. It only updates the necessary fields and returns minimal data.
**Recommendation:** Implement debouncing on the frontend (2-5 seconds) when the user stops typing to avoid flooding the database.

### Clean Architecture
- **Modules**: Books and Chapters are organized in separate modules.
- **Services**: All database logic is encapsulated in service classes.
- **Controllers**: Handle request validation and response formatting.
- **DB Pool**: Uses a connection pool for efficient database interaction.

## Endpoints

- `GET /books`: List all books.
- `POST /books`: Create a new book.
- `GET /books/:id`: Get book details + chapter list.
- `PATCH /chapters/:id`: Update chapter title or content (Autosave).
- `POST /chapters`: Add a new chapter.
- `DELETE /books/:id`: Delete a book and its chapters.
