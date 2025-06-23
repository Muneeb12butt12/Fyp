import Admin from "../models/Admin.js";
import Buyer from "../models/Buyer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import SessionService from "../services/sessionService.js";
import Seller from "../models/Seller.js";
import Suspension from "../models/Suspension.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

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

    const {
      fullName,
      email,
      password,
      phoneNumber,
      bankAccounts,
      wallets,
      commissionBalance,
      totalCommissions,
      totalPayouts,
    } = req.body;

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

    // Create new admin with balance fields
    console.log("Creating new admin object...");
    const admin = new Admin({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "admin",
      bankAccounts: bankAccounts || [],
      wallets: wallets || [],
      commissionBalance: commissionBalance || 0,
      totalCommissions: totalCommissions || 0,
      totalPayouts: totalPayouts || 0,
      commissionHistory: [],
      orders: [],
    });

    console.log("Attempting to save admin to database...");
    await admin.save();
    console.log("Admin saved successfully:", {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      commissionBalance: admin.commissionBalance,
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
        bankAccounts: admin.bankAccounts,
        wallets: admin.wallets,
        commissionBalance: admin.commissionBalance,
        totalCommissions: admin.totalCommissions,
        totalPayouts: admin.totalPayouts,
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
      .select("+password bankAccounts wallets") // Include bank information
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
        bankAccounts: admin.bankAccounts || [],
        wallets: admin.wallets || [],
        commissionBalance: admin.commissionBalance || 0,
        totalCommissions: admin.totalCommissions || 0,
        totalPayouts: admin.totalPayouts || 0,
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

// Get admin details for checkout (public endpoint)
export const getAdminDetailsForCheckout = async (req, res) => {
  try {
    // Get the first admin (since only one admin is allowed)
    const admin = await Admin.findOne()
      .select("fullName email bankAccounts wallets")
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Format the response for checkout
    const adminData = {
      _id: admin._id,
      businessName: "SportWearXpress", // Fixed business name
      fullName: admin.fullName,
      bankAccounts: admin.bankAccounts || [],
      wallets: admin.wallets || [],
      status: "active",
    };

    res.json({
      success: true,
      data: adminData,
    });
  } catch (error) {
    console.error("Get admin details for checkout error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching admin details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get admin profile
export const getProfile = async (req, res) => {
  try {
    console.log("Fetching admin profile for ID:", req.user.id);
    const admin = await Admin.findById(req.user.id)
      .select(
        "fullName email phoneNumber role createdAt bankAccounts wallets commissionBalance totalCommissions totalPayouts commissionHistory"
      )
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
      data: {
        ...admin,
        bankAccounts: admin.bankAccounts || [],
        wallets: admin.wallets || [],
        commissionBalance: admin.commissionBalance || 0,
        totalCommissions: admin.totalCommissions || 0,
        totalPayouts: admin.totalPayouts || 0,
        commissionHistory: admin.commissionHistory || [],
      },
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

// Suspend seller with detailed information
export const suspendSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const {
      reason,
      duration,
      durationType,
      description,
      evidence,
      adminNotes,
      suspensionType,
      effectiveDate,
      notifySeller,
      notifyBuyers,
    } = req.body;

    // Validate required fields
    if (!reason || !description || !evidence) {
      return res.status(400).json({
        success: false,
        message: "Reason, description, and evidence are required",
      });
    }

    // Find the seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Calculate suspension end date
    let suspendedUntil;
    if (suspensionType === "permanent") {
      suspendedUntil = new Date("2099-12-31"); // Far future date for permanent suspension
    } else {
      if (!duration || !durationType) {
        return res.status(400).json({
          success: false,
          message:
            "Duration and duration type are required for temporary suspensions",
        });
      }

      const effectiveDateObj = new Date(effectiveDate);
      const durationInMs = {
        days: duration * 24 * 60 * 60 * 1000,
        weeks: duration * 7 * 24 * 60 * 60 * 1000,
        months: duration * 30 * 24 * 60 * 60 * 1000,
      }[durationType];

      suspendedUntil = new Date(effectiveDateObj.getTime() + durationInMs);
    }

    // Create suspension record
    const suspension = new Suspension({
      seller: sellerId,
      reason,
      suspendedAt: new Date(effectiveDate),
      suspendedUntil,
      suspendedBy: req.user.id,
      status: "active",
      notes: adminNotes,
      complaints: [
        {
          type: "system",
          description: description,
          reportedAt: new Date(),
          status: "resolved",
        },
      ],
    });

    await suspension.save();

    // Update seller status
    seller.isSuspended = true;
    seller.activeSuspension = suspension._id;
    await seller.save();

    // TODO: Send notifications if requested
    if (notifySeller) {
      // Send email/notification to seller
      console.log(
        `Notification sent to seller ${seller.email} about suspension`
      );
    }

    if (notifyBuyers) {
      // Send notifications to buyers with pending orders
      console.log(
        `Notifications sent to buyers with pending orders from seller ${sellerId}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Seller suspended successfully",
      suspension: {
        id: suspension._id,
        reason,
        suspendedAt: suspension.suspendedAt,
        suspendedUntil: suspension.suspendedUntil,
        suspensionType,
        duration:
          suspensionType === "temporary"
            ? `${duration} ${durationType}`
            : "Permanent",
      },
    });
  } catch (error) {
    console.error("Error suspending seller:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending seller",
      error: error.message,
    });
  }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================

// Get all buyers with pagination and filtering
export const getAllBuyers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "all" } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      if (status === "suspended") {
        query.isSuspended = true;
      } else if (status === "active") {
        query.isSuspended = false;
      }
    }

    // Get total count
    const totalBuyers = await Buyer.countDocuments(query);

    // Get buyers with pagination
    const buyers = await Buyer.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const formattedBuyers = buyers.map((buyer) => ({
      id: buyer._id,
      fullName: buyer.fullName,
      email: buyer.email,
      phoneNumber: buyer.phoneNumber || "N/A",
      profilePhoto: buyer.profilePhoto,
      status: buyer.isSuspended ? "suspended" : "active",
      joinedDate: buyer.createdAt,
      ordersCount: buyer.orders ? buyer.orders.length : 0,
      suspensionDetails: buyer.suspensionDetails,
      lastLogin: buyer.lastLogin || null,
    }));

    res.json({
      success: true,
      data: {
        buyers: formattedBuyers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBuyers / limit),
          totalBuyers,
          hasNextPage: page * limit < totalBuyers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching buyers",
      error: error.message,
    });
  }
};

// Get all sellers with pagination and filtering
export const getAllSellers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      verification = "all",
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { "businessInfo.businessName": { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      if (status === "suspended") {
        query.isSuspended = true;
      } else if (status === "active") {
        query.isSuspended = false;
      }
    }

    if (verification !== "all") {
      if (verification === "verified") {
        query.isVerified = true;
      } else if (verification === "unverified") {
        query.isVerified = false;
      }
    }

    // Get total count
    const totalSellers = await Seller.countDocuments(query);

    // Get sellers with pagination
    const sellers = await Seller.find(query)
      .select("-password")
      .populate("activeSuspension")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format response
    const formattedSellers = sellers.map((seller) => ({
      id: seller._id,
      fullName: seller.fullName,
      email: seller.email,
      phoneNumber: seller.phoneNumber || "N/A",
      businessInfo: seller.businessInfo,
      status: seller.isSuspended ? "suspended" : "active",
      isVerified: seller.isVerified,
      isSuspended: seller.isSuspended,
      joinedDate: seller.createdAt,
      products: seller.products || [],
      orders: seller.orders || [],
      profilePhoto: seller.profilePhoto,
      suspensionDetails: seller.activeSuspension,
      bankAccountsCount: seller.bankAccounts ? seller.bankAccounts.length : 0,
      walletsCount: seller.wallets ? seller.wallets.length : 0,
    }));

    res.json({
      success: true,
      data: {
        sellers: formattedSellers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSellers / limit),
          totalSellers,
          hasNextPage: page * limit < totalSellers,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sellers",
      error: error.message,
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const userType = req.query.userType;

    if (!userType || !["buyer", "seller"].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be "buyer" or "seller"',
      });
    }

    let user;
    if (userType === "buyer") {
      user = await Buyer.findById(userId).populate("orders").lean();
    } else {
      user = await Seller.findById(userId)
        .populate(["orders", "products"])
        .lean();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate statistics
    const stats = {
      totalOrders: user.orders ? user.orders.length : 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderDate: null,
      orderStatusBreakdown: {},
    };

    if (user.orders && user.orders.length > 0) {
      stats.totalSpent = user.orders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
      stats.averageOrderValue = stats.totalSpent / stats.totalOrders;
      stats.lastOrderDate = new Date(
        Math.max(...user.orders.map((o) => new Date(o.createdAt)))
      );

      // Order status breakdown
      user.orders.forEach((order) => {
        const status = order.status || "unknown";
        stats.orderStatusBreakdown[status] =
          (stats.orderStatusBreakdown[status] || 0) + 1;
      });
    }

    if (userType === "seller") {
      stats.totalProducts = user.products ? user.products.length : 0;
      stats.totalRevenue = stats.totalSpent; // For sellers, totalSpent is actually revenue
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

// Toggle buyer status (suspend/activate)
export const toggleBuyerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'suspend' or 'activate'

    if (!action || !["suspend", "activate"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be "suspend" or "activate"',
      });
    }

    const buyer = await Buyer.findById(userId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    buyer.isSuspended = action === "suspend";
    await buyer.save();

    res.json({
      success: true,
      message: `Buyer ${
        action === "suspend" ? "suspended" : "activated"
      } successfully`,
      buyer: {
        id: buyer._id,
        fullName: buyer.fullName,
        email: buyer.email,
        status: buyer.isSuspended ? "suspended" : "active",
        suspensionDetails: buyer.suspensionDetails,
      },
    });
  } catch (error) {
    console.error("Error toggling buyer status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating buyer status",
      error: error.message,
    });
  }
};

// Activate (unsuspend) seller
export const activateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Remove suspension
    seller.isSuspended = false;
    seller.activeSuspension = null;

    // Update any active suspension to inactive
    if (seller.activeSuspension) {
      await Suspension.findByIdAndUpdate(seller.activeSuspension, {
        status: "inactive",
        reactivatedAt: new Date(),
        reactivatedBy: req.user._id,
      });
    }

    await seller.save();

    res.json({
      success: true,
      message: "Seller activated successfully",
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        status: "active",
        isVerified: seller.isVerified,
      },
    });
  } catch (error) {
    console.error("Error activating seller:", error);
    res.status(500).json({
      success: false,
      message: "Error activating seller",
      error: error.message,
    });
  }
};

// Get user details (buyer or seller)
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const userType = req.query.userType;

    console.log("getUserDetails called with:", { userId, userType });

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid ObjectId format:", userId);
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Validate userType
    if (!userType || !["buyer", "seller"].includes(userType)) {
      console.log("Invalid userType:", userType);
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be "buyer" or "seller"',
      });
    }

    let user;
    try {
      if (userType === "buyer") {
        user = await Buyer.findById(userId)
          .select("-password")
          .populate("orders")
          .lean();
      } else if (userType === "seller") {
        user = await Seller.findById(userId)
          .select("-password")
          .populate(["orders", "products", "activeSuspension"])
          .lean();
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Database error while fetching user",
        error:
          process.env.NODE_ENV === "development" ? dbError.message : undefined,
      });
    }

    if (!user) {
      console.log("User not found:", { userId, userType });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found successfully:", {
      userId,
      userType,
      userEmail: user.email,
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get individual seller details
export const getSellerDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId)
      .select("-password")
      .populate("activeSuspension")
      .populate("products")
      .populate("orders")
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Format the response
    const formattedSeller = {
      id: seller._id,
      fullName: seller.fullName,
      email: seller.email,
      phone: seller.phoneNumber || "N/A",
      businessInfo: seller.businessInfo,
      status: seller.isSuspended ? "suspended" : "active",
      isVerified: seller.isVerified,
      isSuspended: seller.isSuspended,
      joinedDate: seller.createdAt,
      products: seller.products || [],
      orders: seller.orders || [],
      profilePhoto: seller.profilePhoto,
      suspensionDetails: seller.activeSuspension,
    };

    res.json({
      success: true,
      seller: formattedSeller,
    });
  } catch (error) {
    console.error("Error fetching seller details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller details",
      error: error.message,
    });
  }
};

// Add bank account to admin
export const addBankAccount = async (req, res) => {
  try {
    const {
      type,
      accountNumber,
      accountTitle,
      branchCode,
      isDefault,
      otherBankName,
    } = req.body;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const bankAccount = {
      type,
      accountNumber,
      accountTitle,
      branchCode,
      isDefault: isDefault || false,
      otherBankName,
    };

    await admin.addBankAccount(bankAccount);

    res.json({
      success: true,
      message: "Bank account added successfully",
      bankAccounts: admin.bankAccounts,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({
      success: false,
      message: "Error adding bank account",
      error: error.message,
    });
  }
};

// Add wallet to admin
export const addWallet = async (req, res) => {
  try {
    const { type, accountNumber, accountTitle, isDefault, otherWalletName } =
      req.body;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const wallet = {
      type,
      accountNumber,
      accountTitle,
      isDefault: isDefault || false,
      otherWalletName,
    };

    await admin.addWallet(wallet);

    res.json({
      success: true,
      message: "Wallet added successfully",
      wallets: admin.wallets,
    });
  } catch (error) {
    console.error("Error adding wallet:", error);
    res.status(500).json({
      success: false,
      message: "Error adding wallet",
      error: error.message,
    });
  }
};

// Set default bank account
export const setDefaultBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await admin.setDefaultBankAccount(accountId);

    res.json({
      success: true,
      message: "Default bank account set successfully",
      bankAccounts: admin.bankAccounts,
    });
  } catch (error) {
    console.error("Error setting default bank account:", error);
    res.status(500).json({
      success: false,
      message: "Error setting default bank account",
      error: error.message,
    });
  }
};

// Set default wallet
export const setDefaultWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await admin.setDefaultWallet(walletId);

    res.json({
      success: true,
      message: "Default wallet set successfully",
      wallets: admin.wallets,
    });
  } catch (error) {
    console.error("Error setting default wallet:", error);
    res.status(500).json({
      success: false,
      message: "Error setting default wallet",
      error: error.message,
    });
  }
};

// Remove bank account
export const removeBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await admin.removeBankAccount(accountId);

    res.json({
      success: true,
      message: "Bank account removed successfully",
      bankAccounts: admin.bankAccounts,
    });
  } catch (error) {
    console.error("Error removing bank account:", error);
    res.status(500).json({
      success: false,
      message: "Error removing bank account",
      error: error.message,
    });
  }
};

// Remove wallet
export const removeWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await admin.removeWallet(walletId);

    res.json({
      success: true,
      message: "Wallet removed successfully",
      wallets: admin.wallets,
    });
  } catch (error) {
    console.error("Error removing wallet:", error);
    res.status(500).json({
      success: false,
      message: "Error removing wallet",
      error: error.message,
    });
  }
};

// Update admin profile with bank information
export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, bankAccounts, wallets } = req.body;
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Update basic info
    if (fullName) admin.fullName = fullName;
    if (phoneNumber) admin.phoneNumber = phoneNumber;

    // Update bank information if provided
    if (bankAccounts) admin.bankAccounts = bankAccounts;
    if (wallets) admin.wallets = wallets;

    await admin.save();

    res.json({
      success: true,
      message: "Admin profile updated successfully",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: admin.role,
        bankAccounts: admin.bankAccounts,
        wallets: admin.wallets,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin profile",
      error: error.message,
    });
  }
};

// Get admin orders
export const getAdminOrders = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId).populate({
      path: "orders",
      populate: [
        { path: "buyer", select: "fullName email" },
        { path: "items.product", select: "name price images" },
        { path: "paymentId" },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Admin orders retrieved successfully",
      data: { orders: admin.orders || [] },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
