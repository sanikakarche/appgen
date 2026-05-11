import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/index.js'; // Import your new function
import authRoutes from './routes/auth.js';
import appRoutes from './routes/apps.js';
import dataRoutes from './routes/data.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database before starting the server
initDB().then(() => {
  app.use('/api/auth', authRoutes);
  app.use('/api/apps', appRoutes);
  app.use('/api/data', dataRoutes);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to DB error', err);
});