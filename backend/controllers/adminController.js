import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import SessionService from "../services/sessionService.js";
import Seller from "../models/Seller.js";
import Suspension from "../models/Suspension.js";

dotenv.config();

// Register admin (only one admin allowed)
export const register = async (req, res) => {
  try {
    console.log("\n=== Admin Registration Started ===");
    console.log("Request body:", { ...req.body, password: "[REDACTED]" });
    console.log("Environment variables:", {
      MONGODB_URI: process.env.MONGODB_URI ? "Set" : "Not set",
      JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
      NODE_ENV: process.env.NODE_ENV,
    });

    // Check if admin already exists
    const adminCount = await Admin.countDocuments();
    console.log("Current admin count:", adminCount);

    if (adminCount > 0) {
      console.log("Admin already exists");
      return res.status(400).json({
        message:
          "Admin already exists. Only one admin is allowed in the system.",
      });
    }

    const { fullName, email, password, phoneNumber } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      console.log("Missing required fields:", {
        fullName: !fullName,
        email: !email,
        password: !password,
      });
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          fullName: !fullName,
          email: !email,
          password: !password,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short");
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if email is already in use
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Email already in use:", email);
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    console.log("Creating new admin object...");
    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "admin",
    });

    console.log("Attempting to save admin to database...");
    await admin.save();
    console.log("Admin saved successfully:", {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    // Create JWT token
    console.log("Creating JWT token...");
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("=== Admin Registration Completed Successfully ===\n");
    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("\n=== Admin Registration Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({
      message: "Error registering admin",
      error: error.message,
    });
  }
};

// Login admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email with only necessary fields
    const admin = await Admin.findOne({ email })
      .select("+password") // Explicitly select password field
      .lean(); // Convert to plain object for better performance

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token with more secure options
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );

    // Create session
    await SessionService.createSession(admin._id, "Admin", token, req);

    // Remove sensitive data
    delete admin.password;

    // Send response
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: "admin",
        profilePhoto: admin.profilePhoto || null,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get login history
export const getLoginHistory = async (req, res) => {
  try {
    const sessions = await SessionService.getUserSessions(req.user.id, "Admin");
    res.json({ history: sessions });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout admin
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await SessionService.deactivateSession(token);
    }
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check if admin exists
export const checkAdminExists = async (req, res) => {
  try {
    console.log("\n=== Checking Admin Existence ===");
    const adminCount = await Admin.countDocuments();
    console.log("Admin count:", adminCount);
    console.log("=== Admin Check Completed ===\n");
    res.json({ exists: adminCount > 0 });
  } catch (error) {
    console.error("\n=== Admin Check Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("=== End of Error ===\n");
    res.status(500).json({ message: "Error checking admin existence" });
  }
};

// Get admin profile
export const getProfile = async (req, res) => {
  try {
    console.log("Fetching admin profile for ID:", req.user.id);
    const admin = await Admin.findById(req.user.id)
      .select("fullName email phoneNumber role createdAt")
      .lean();

    if (!admin) {
      console.log("Admin not found");
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    console.log("Admin profile found:", admin);
    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all unverified sellers
export const getUnverifiedSellers = async (req, res) => {
  try {
    console.log("Getting unverified sellers...");
    console.log("Admin user:", req.user);

    const sellers = await Seller.find({ isVerified: false })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log(`Found ${sellers.length} unverified sellers`);
    res.json(sellers);
  } catch (error) {
    console.error("Error getting unverified sellers:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify a seller
export const verifySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.isVerified = true;
    await seller.save();

    res.json({ message: "Seller verified successfully", seller });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend a seller
export const suspendSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { reason, suspendedUntil, notes } = req.body;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Create new suspension
    const suspension = new Suspension({
      seller: sellerId,
      reason,
      suspendedUntil,
      suspendedBy: req.user._id,
      notes,
      status: "active",
    });

    await suspension.save();

    // Update seller
    seller.isSuspended = true;
    seller.activeSuspension = suspension._id;
    seller.suspensionHistory.push(suspension._id);
    await seller.save();

    res.json({
      message: "Seller suspended successfully",
      suspension,
      seller,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
