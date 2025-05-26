import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Optional: Add token verification function
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};