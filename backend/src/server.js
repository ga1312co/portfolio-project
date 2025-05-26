import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import projectRoutes from './routes/projectRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// Initialize express app
const app = express();
export const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/', (req, res) => {
  res.send('Portfolio API is running! 🚀');
});

// API routes
app.use('/projects', projectRoutes);
app.use('/images', imageRoutes);
app.use('/experiences', experienceRoutes);
app.use('/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});