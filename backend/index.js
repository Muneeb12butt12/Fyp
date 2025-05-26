import 'dotenv/config'; // MUST be first import
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet'; // Security middleware
import rateLimit from 'express-rate-limit'; // Rate limiting
import authRoutes from './routes/auth.js';
import { logRequests, logErrors } from './middleware/logging.js'; // Custom logging

const app = express();

// 🔒 Environment Validation
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'NODE_ENV'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`❌ FATAL ERROR: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// ⚡ Performance Monitoring
app.use((req, res, next) => {
  res.locals.startTime = process.hrtime();
  next();
});

// 🛡️ Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🚦 Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 📦 Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 📝 Request Logging
app.use(logRequests);

// 🔗 MongoDB Connection
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  maxPoolSize: 50,
  retryWrites: true,
  w: 'majority'
};

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => {
    console.log('✅ MongoDB connected');
    mongoose.connection.on('error', err => console.error('❌ MongoDB runtime error:', err));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 🛣️ API Routes
app.use('/api/auth', authRoutes);

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'OK',
    uptime: `${uptime.toFixed(2)} seconds`,
    dbState: mongoose.connection.readyState, // 1 = connected
    memoryUsage: {
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
    },
    environment: process.env.NODE_ENV
  });
});

// ⚠️ Global Error Handling
app.use(logErrors); // Log errors first
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  if (statusCode === 500) {
    console.error('🔥 Unhandled Error:', {
      error: err.stack || err,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body
      }
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 🚀 Server Initialization
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// 🛑 Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('✅ All connections closed. Server terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));