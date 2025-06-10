// routes/profileRoutes.js
import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';  // Make sure this path is correct
import upload from '../utils/upload.js';

const router = express.Router();

// Protected routes
router.get('/', protect, getProfile);
router.put('/', protect, upload.single('profilePicture'), updateProfile);

export default router;