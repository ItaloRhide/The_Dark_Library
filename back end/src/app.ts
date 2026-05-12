import express from 'express';
import cors from 'cors';
import path from 'path';
import bookRoutes from './modules/books/books.routes';
import chapterRoutes from './modules/chapters/chapters.routes';
import logger from './utils/logger';

const app = express();

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/books', bookRoutes);
app.use('/chapters', chapterRoutes);

// Simple Health Check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
