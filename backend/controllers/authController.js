import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import validator from 'validator';

// Check email availability
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const user = await User.findOne({ email });
    res.status(200).json({ 
      success: true,
      exists: !!user 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error checking email' 
    });
  }
};

// Register new user
export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password,userType = 'buyer' } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered'
      });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      userType
    });

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    newUser.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user: newUser
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ 
        success: false,
        errors 
      });
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        success: true,
        message: 'If email exists, reset code will be sent'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        to: user.email,
        from: process.env.EMAIL_FROM,
        subject: 'Password Reset Code',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset</h2>
            <p>Your verification code is:</p>
            <h3>${resetCode}</h3>
            <p>Valid for 10 minutes</p>
          </div>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Reset code sent',
        token: resetToken,
        email: user.email
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email sending failed'
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// Verify Reset Code
export const verifyResetCode = async (req, res) => {
  try {
    const { token, code } = req.body;
    
    if (!token || !code) {
      return res.status(400).json({
        success: false,
        message: 'Token and code required'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user || user.passwordResetCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code verified',
      token,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      message: 'Password updated',
      token: authToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};