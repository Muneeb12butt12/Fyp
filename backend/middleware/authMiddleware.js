import jwt from 'jsonwebtoken';
import User from '../models/Order.js';

// Cache for revoked tokens (in production, use Redis)
const tokenBlacklist = new Set();

export const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in multiple locations
    const token = 
      req.headers.authorization?.split(' ')[1] || // Bearer token
      req.cookies?.token || // HTTP-only cookie
      req.signedCookies?.token; // Signed cookie

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        docs: process.env.API_DOCS_URL + '/authentication'
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    // Verify token with multiple checks
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-client',
      maxAge: process.env.JWT_EXPIRE || '1h'
    });

    // Check if token has required claims
    if (!decoded.userId || !decoded.iat) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token claims',
        code: 'INVALID_TOKEN_CLAIMS'
      });
    }

    // Get user with session validation
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken')
      .lean();

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'User session invalid',
        code: 'SESSION_INVALID'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach user to request with security context
    req.user = {
      ...user,
      _id: user._id.toString(), // Convert to string for consistency
      permissions: user.roles?.flatMap(role => role.permissions) || []
    };

    // Security headers
    res.set({
      'X-Authenticated-User': user._id,
      'X-Authenticated-Roles': user.roles?.join(',') || 'user'
    });

    next();
  } catch (error) {
    // Enhanced error handling
    let status = 401;
    let message = 'Authentication failed';
    let code = 'AUTH_FAILED';

    if (error.name === 'TokenExpiredError') {
      message = 'Session expired';
      code = 'SESSION_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token';
      code = 'TOKEN_INVALID';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active';
      code = 'TOKEN_INACTIVE';
      status = 403;
    } else {
      status = 500;
      message = 'Authentication error';
      code = 'AUTH_ERROR';
      console.error('Authentication middleware error:', error);
    }

    res.status(status).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: 'Administrator privileges required',
      code: 'ADMIN_REQUIRED',
      requiredPermissions: ['admin.access'],
      userPermissions: req.user?.permissions || []
    });
  }
  next();
};

export const roleMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasRole = requiredRoles.some(role => 
      req.user.roles?.includes(role) || 
      req.user.isAdmin // Admins bypass role checks
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredRoles,
        userRoles: req.user.roles || []
      });
    }

    next();
  };
};

export const permissionMiddleware = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasPermission = requiredPermissions.every(permission => 
      req.user.permissions?.includes(permission) ||
      req.user.isAdmin // Admins bypass permission checks
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN',
        requiredPermissions,
        userPermissions: req.user.permissions || []
      });
    }

    next();
  };
};

// Token revocation utility
export const revokeToken = (token) => {
  tokenBlacklist.add(token);
  setTimeout(() => tokenBlacklist.delete(token), 
    parseInt(process.env.JWT_EXPIRE || '3600000', 10)
  );
};
export default authMiddleware;