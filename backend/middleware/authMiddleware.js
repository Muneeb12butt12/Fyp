const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication Middleware
// backend/middleware/authMiddleware.js

const authMiddleware = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from the header
      token = req.headers.authorization.split(" ")[1];

      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Log the decoded payload for debugging
      console.log("Decoded Token:", decoded);

      // Find the user in the database
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        console.log("User not found in database");
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      // Attach user to the request object
      req.user = user;

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Error in authMiddleware:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

// Admin Middleware
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { authMiddleware, adminMiddleware };
