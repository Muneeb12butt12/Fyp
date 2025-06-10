// authRoutes.js
import express from 'express';
import { checkEmail, register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/check-email', checkEmail); // Make sure this line exists
router.post('/register', register);
router.post('/login', login);

export default router; // Must be exported as default