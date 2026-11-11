import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import articleRoutes from './routes/articleRoutes';
import videoRoutes from './routes/videoRoutes';
import submissionRoutes from './routes/submissionRoutes';
import userRoutes from './routes/userRoutes';
import notificationRoutes from './routes/notificationRoutes';
import metaRoutes from './routes/metaRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import dltRoutes from './routes/dltRoutes';
import supportRoutes from './routes/supportRoutes';
import { dltService } from './services/dltService';
import { db } from './data/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for mobile app, web apps, and development
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-user-id',
      'x-user-role',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// DLT Ledger is synchronized via connectDB in config/db.ts
// Request logger with Client IP, Session Identification, and Route Tracking
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.originalUrl.startsWith('/api/')) {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const clientIp = typeof rawIp === 'string' ? rawIp.replace('::ffff:', '') : Array.isArray(rawIp) ? rawIp[0] : '127.0.0.1';
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const userAgent = req.headers['user-agent'] || '';
    const isMobileApp = userAgent.includes('okhttp') || userAgent.includes('Expo') || userAgent.includes('Mobile') || Boolean(req.headers['x-client-platform']);
    const deviceType = isMobileApp ? '📱 MOBILE APP' : '💻 WEB BROWSER';

    const userBadge = userId
      ? `🔑 [USER: ${userRole || 'CITIZEN'}]`
      : `👤 [NEW VISITOR / INCOGNITO]`;

    console.log(`[${new Date().toLocaleTimeString()}] ${deviceType} | ${userBadge} | IP: ${clientIp} -> ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root API Health route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Next Truth News & SusaLabs DLT Protocol API is live and operational',
    version: '2.0.0',
    documentation: '/api/health',
    modules: ['articles', 'videos', 'submissions', 'users', 'admin', 'dlt', 'support'],
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dlt', dltRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', metaRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (process.env.NODE_ENV !== 'test') {
  connectDB().then((connected) => {
    if (!connected) {
      dltService.initializeGenesis(db.articles);
    }
    const serverPort = Number(PORT) || 5000;
    const server = app.listen(serverPort, '0.0.0.0', () => {
      console.log(`========================================`);
      console.log(`🚀 Next Truth & SusaLabs API Server running on port ${serverPort} (0.0.0.0)`);
      console.log(`📡 Health Check: http://localhost:${serverPort}/api/health`);
      console.log(`🔒 DLT Ledger Explorer: http://localhost:${serverPort}/api/dlt/ledger`);
      console.log(`🍃 Database: MongoDB (${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexttruth'})`);
      console.log(`========================================`);
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️  Port ${serverPort} is currently occupied by another process.`);
        console.error(`💡 Run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${serverPort}).OwningProcess -Force\n`);
      }
    });
  });
}

export default app;
