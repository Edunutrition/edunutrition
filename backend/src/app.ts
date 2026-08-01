import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import modulesRoutes from './routes/modules.js';
import progressRoutes from './routes/progress.js';
import schoolsRoutes from './routes/schools.js';
import usersRoutes from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/modules', modulesRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/schools', schoolsRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/analytics', analyticsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
