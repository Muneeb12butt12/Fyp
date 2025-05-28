import express from 'express';
import { 
  login, 
  signup, 
  checkExistingData, 
  getProfile, 
  updateProfile 
} from '../controllers/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadProfilePicture } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ... (keep your existing registration and login routes)

// Profile routes
router.get('/profile', authMiddleware, getProfile);
router.put(
  '/profile', 
  authMiddleware, 
  uploadProfilePicture, 
  updateProfile
);

export default router;