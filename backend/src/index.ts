import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import authRoutes from './routes/auth';
import appRoutes from './routes/apps';
import dataRoutes from './routes/data';

dotenv.config();

const app = express();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/data', dataRoutes);

// Fix: added /api prefix to match what you're testing
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Fix: initialize DB without blocking, export app for Vercel
initDB().catch(console.error);

// Fix: only listen locally, export for Vercel serverless
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
}

export default app;