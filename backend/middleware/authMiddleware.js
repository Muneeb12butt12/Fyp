import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Enhanced token blacklist (with TTL cleanup)
const tokenBlacklist = new Map();

export const authMiddleware = async (req, res, next) => {
  try {
    // Enhanced token extraction from multiple sources
    const token = extractToken(req);
    
    if (!token) {
      return sendAuthError(res, 'No authentication token provided', 'TOKEN_MISSING');
    }

    // Check token revocation
    if (isTokenRevoked(token)) {
      return sendAuthError(res, 'Token revoked', 'TOKEN_REVOKED');
    }

    // Verify and decode token with enhanced validation
    const decoded = verifyToken(token);
    if (!decoded) {
      return sendAuthError(res, 'Invalid token', 'TOKEN_INVALID');
    }

    // Validate token claims
    if (!validateTokenClaims(decoded)) {
      return sendAuthError(res, 'Invalid token claims', 'INVALID_TOKEN_CLAIMS');
    }

    // Fetch and validate user
    const user = await validateUserSession(decoded);
    if (!user) {
      return sendAuthError(res, 'User session invalid', 'SESSION_INVALID');
    }

    // Check account status
    if (!user.isActive) {
      return sendAuthError(res, 'Account deactivated', 'ACCOUNT_DEACTIVATED', 403);
    }

    // Attach user to request with enhanced security context
    attachUserToRequest(req, res, user);
    
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
};

// Helper Functions

function extractToken(req) {
  return (
    req.headers.authorization?.replace(/^Bearer\s+/i, '') || // Bearer token
    req.headers['x-access-token'] || // Custom header
    req.cookies?.token || // HTTP-only cookie
    req.signedCookies?.token // Signed cookie
  );
}

function isTokenRevoked(token) {
  return tokenBlacklist.has(token);
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-client',
      maxAge: process.env.JWT_EXPIRE || '1h'
    });
  } catch (error) {
    return null;
  }
}

function validateTokenClaims(decoded) {
  return decoded.userId && decoded.iat && decoded.tokenVersion !== undefined;
}

async function validateUserSession(decoded) {
  const user = await User.findById(decoded.userId)
    .select('-password -refreshToken')
    .lean();

  return user?.tokenVersion === decoded.tokenVersion ? user : null;
}

function attachUserToRequest(req, res, user) {
  req.user = {
    ...user,
    _id: user._id.toString(),
    permissions: user.roles?.flatMap(role => role.permissions) || []
  };

  // Security headers
  res.set({
    'X-Authenticated-User': user._id,
    'X-Authenticated-Roles': user.roles?.join(',') || 'user',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY'
  });
}

function sendAuthError(res, message, code, status = 401) {
  return res.status(status).json({
    success: false,
    message,
    code,
    docs: process.env.API_DOCS_URL + '/authentication'
  });
}

function handleAuthError(error, res) {
  let status = 401;
  let message = 'Authentication failed';
  let code = 'AUTH_FAILED';

  switch (error.name) {
    case 'TokenExpiredError':
      message = 'Session expired';
      code = 'SESSION_EXPIRED';
      break;
    case 'JsonWebTokenError':
      message = 'Invalid token';
      code = 'TOKEN_INVALID';
      break;
    case 'NotBeforeError':
      message = 'Token not active';
      code = 'TOKEN_INACTIVE';
      status = 403;
      break;
    default:
      status = 500;
      message = 'Authentication error';
      code = 'AUTH_ERROR';
      console.error('Authentication middleware error:', error);
  }

  const response = {
    success: false,
    message,
    code
  };

  if (process.env.NODE_ENV === 'development') {
    response.detail = error.message;
    response.stack = error.stack;
  }

  res.status(status).json(response);
}

// Middleware for role-based access
export const roleMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendAuthError(res, 'Authentication required', 'AUTH_REQUIRED');
    }

    const hasRole = requiredRoles.some(role => 
      req.user.roles?.includes(role) || 
      req.user.isAdmin
    );

    if (!hasRole) {
      return sendAuthError(res, 'Insufficient permissions', 'FORBIDDEN', 403);
    }

    next();
  };
};

// Middleware for permission-based access
export const permissionMiddleware = (requiredPermissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendAuthError(res, 'Authentication required', 'AUTH_REQUIRED');
    }

    const hasPermission = requiredPermissions.every(permission => 
      req.user.permissions?.includes(permission) ||
      req.user.isAdmin
    );

    if (!hasPermission) {
      return sendAuthError(res, 'Insufficient permissions', 'FORBIDDEN', 403);
    }

    next();
  };
};

// Admin-specific middleware
export const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return sendAuthError(
      res,
      'Administrator privileges required',
      'ADMIN_REQUIRED',
      403
    );
  }
  next();
};

// Token management utilities
export const revokeToken = (token) => {
  const ttl = parseInt(process.env.JWT_EXPIRE || '3600000', 10);
  tokenBlacklist.set(token, true);
  
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, ttl);
};

export const revokeAllTokensForUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '1h',
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-client'
    }
  );
};

export default authMiddleware;