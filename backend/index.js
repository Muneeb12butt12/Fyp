import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Initialize environment variables
dotenv.config();

// ES Modules fix for __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app = express();

// Constants
const PORT = process.env.PORT || 5000;
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads', 'profile');
const PRODUCT_UPLOADS_DIR = path.join(__dirname, 'public', 'uploads', 'products');

// Database connection
connectDB()
  .then(() => {
    console.log('MongoDB Connected');
    
    // Ensure uploads directories exist
    createDirectories();
    
    // Configure middleware
    configureMiddleware();
    
    // Setup routes
    setupRoutes();
    
    // Start server
    startServer();
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Functions for better organization
function createDirectories() {
  // Create profile uploads directory
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('Profile uploads directory created at:', UPLOADS_DIR);
  }
  
  // Create product uploads directory if needed
  if (!fs.existsSync(PRODUCT_UPLOADS_DIR)) {
    fs.mkdirSync(PRODUCT_UPLOADS_DIR, { recursive: true });
    console.log('Product uploads directory created at:', PRODUCT_UPLOADS_DIR);
  }
}

function configureMiddleware() {
  // Security and CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Preflight requests
  app.options('*', cors());
  
  // Request parsing
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Logging
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
  
  // Static files
  app.use('/uploads/profile', express.static(UPLOADS_DIR));
  app.use('/uploads/products', express.static(PRODUCT_UPLOADS_DIR));
  
  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

function setupRoutes() {
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/admin', adminRoutes);
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const healthcheck = {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version,
      services: [
        { name: 'auth', routes: ['/api/auth'] },
        { name: 'profile', routes: ['/api/profile'] },
        { name: 'orders', routes: ['/api/orders'] },
        { name: 'products', routes: ['/api/products'] },
        { name: 'users', routes: ['/api/users'] }

      ]
    };
    res.status(200).json(healthcheck);
  });
  
  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
    if (fs.existsSync(clientBuildPath)) {
      app.use(express.static(clientBuildPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(clientBuildPath, 'index.html'));
      });
    }
  }
  
  // Error handling (should be last)
  app.use(notFound);
  app.use(errorHandler);
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Available routes:`);
    console.log(`- Authentication:`);
    console.log(`  POST   /api/auth/login`);
    console.log(`  POST   /api/auth/register`);
    console.log(`  POST   /api/auth/logout`);
    console.log(`  GET    /api/auth/me`);
    console.log(`- Profile:`);
    console.log(`  GET    /api/profile`);
    console.log(`  PUT    /api/profile`);
    console.log(`- Orders:`);
    console.log(`  POST   /api/orders`);
    console.log(`  GET    /api/orders/:id`);
    console.log(`  GET    /api/orders/user/:userId`);
    console.log(`  PUT    /api/orders/:id/pay`);
    console.log(`  PUT    /api/orders/:id/deliver`);
    console.log(`  GET    /api/orders/admin/all`);
    console.log(`- Products:`);
    console.log(`  GET    /api/products`);
    console.log(`  GET    /api/products/:id`);
    console.log(`  POST   /api/products`);
    console.log(`  PUT    /api/products/:id`);
    console.log(`  DELETE /api/products/:id`);
    console.log(`- Health:`);
    console.log(`  GET    /api/health`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  // Handle SIGTERM for graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
}