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
  origin: [
    "https://appgen-theta.vercel.app", 
    "https://appgen-theta.vercel.app/login",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/apps', appRoutes);
app.use('/api/data', dataRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
});