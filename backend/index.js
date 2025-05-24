import 'dotenv/config'; // MUST be first import
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

// 🔒 Check for required environment variables
if (!process.env.JWT_SECRET || !process.env.MONGODB_URI) {
  console.error('❌ FATAL ERROR: JWT_SECRET or MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// ✅ Middleware: Body parser for JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 CORS Configuration
app.use(cors());

// 🔗 Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 🛣️ API Routes
app.use('/api/auth', authRoutes);

// ✅ Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState, // 1 = connected
    jwtConfigured: !!process.env.JWT_SECRET
  });
});

// ⚠️ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🌐 Global error handler:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// 🧯 Handle Server Errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
});
