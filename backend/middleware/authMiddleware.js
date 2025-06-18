import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    // 1. Get token from header or cookie
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists'
      });
    }

    // 4. Check if user changed password after token was issued (if implemented)
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password. Please login again.'
      });
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      const message = error.message === 'jwt malformed' 
        ? 'Invalid or malformed token' 
        : 'Invalid token';
      return res.status(401).json({
        success: false,
        message,
        isTokenInvalid: true
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
        isTokenExpired: true
      });
    }

    // Handle other errors
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

export { protect, admin };