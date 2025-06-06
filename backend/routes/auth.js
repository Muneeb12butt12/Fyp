import express from 'express';
import { 
  login, 
  signup, 
  checkExistingData  // Import the new controller
} from '../controllers/auth.js';

const router = express.Router();

// Registration and Login
router.post('/register', signup); 
router.post('/login', login);

// New endpoint to check if data exists
router.post('/check-data', checkExistingData);

export default router;