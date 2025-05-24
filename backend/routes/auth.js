import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

router.post(
  '/signup',
  [
    check('firstName', 'First name is required').trim().notEmpty(),
    check('lastName', 'Last name is required').trim().notEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('phone', 'Phone must be at least 10 digits').optional().isLength({ min: 10 }),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phone, password } = req.body;

    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          errors: [{ msg: 'User already exists', param: 'email' }]
        });
      }

      // Create new user
      const user = new User({ firstName, lastName, email, phone, password });

      // Save user (password gets hashed by pre-save hook)
      await user.save();

      // Verify JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT secret not configured');
      }

      // Create JWT payload
      const payload = { 
        user: { 
          id: user.id,
          email: user.email
        } 
      };

      // Generate token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5d' },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({ 
            token,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            }
          });
        }
      );

    } catch (err) {
      console.error('Signup Error:', err.message);
      res.status(500).json({
        errors: [{
          msg: 'Server error',
          detail: process.env.NODE_ENV === 'development' ? err.message : undefined
        }]
      });
    }
  }
);

export default router;