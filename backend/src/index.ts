import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { getDB } from './config/db';
import { seedAdminUser } from './controllers/auth';
import authRoutes from './routes/auth';
import leadRoutes from './routes/leads';

// Load environment configuration variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server calls
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

// Attach API routing prefixes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

const startServer = async () => {
  console.log('[SERVER] Starting QualiAI Backend Services...');
  
  try {
    // Force DB initialization and run auto-migrations
    await getDB();
    
    // Seed default admin user (admin@quali.ai / admin123) if database is empty
    await seedAdminUser();

    app.listen(PORT, () => {
      console.log(`[SERVER] Services listening successfully on http://localhost:${PORT}`);
      console.log(`[SERVER] API health indicator: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('[SERVER] Critical crash during server startup initialization:', error);
    process.exit(1);
  }
};

startServer();
