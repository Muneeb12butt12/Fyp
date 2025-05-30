import express from 'express';
import { 
  login, 
  signup, 
  getProfile, 
  updateProfile 
} from '../controllers/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Email availability check endpoint
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required',
        code: 'EMAIL_REQUIRED'
      });
    }

    const user = await User.findOne({ email }).select('_id email');
    
    res.status(200).json({
      success: true,
      exists: !!user,
      message: user ? 'Email already registered' : 'Email available'
    });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// Registration endpoint
router.post('/register', signup);
router.post('/signup', signup); // Alternative endpoint

// Other routes...
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;