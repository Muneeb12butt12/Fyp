import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Keep all existing imports
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

// Keep all existing routes
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';


// NEW: Add messenger routes
import messageRoutes from './routes/messageRoutes.js';

// Keep existing middleware imports
import { protect, socketAuth } from './middleware/authMiddleware.js';

// NEW: Socket configuration
import configureSocket from './socket/index.js';

// ES module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config (unchanged)
dotenv.config();

// Validate env vars (add CLIENT_URL)
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'PORT', 'CLIENT_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

const app = express();
const httpServer = createServer(app); // For Socket.io

// Socket.io Setup (NEW)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Apply auth and configure
io.use(socketAuth);
configureSocket(io);
app.set('io', io); // Make io available in routes

// ALL EXISTING MIDDLEWARE (unchanged)
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ALL EXISTING ROUTES (unchanged)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);



// NEW: Add messenger routes (with existing protect middleware)
app.use('/api/messages', protect, messageRoutes);

// Enhanced Health Check (add websocket status)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    websockets: io.engine.clientsCount // NEW
  });
});

// Keep all existing handlers (404, error, etc.)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND'
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Startup with Socket.io support
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`
        🚀 Server running on port ${process.env.PORT || 5000}
        🔗 Base URL: http://localhost:${process.env.PORT || 5000}
        🌐 Environment: ${process.env.NODE_ENV || 'development'}
        🛡️ Security headers enabled
        🔌 WebSocket server ready (NEW)
        📦 Connected to MongoDB
      `);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

export { app, io };