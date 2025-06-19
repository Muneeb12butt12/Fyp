import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

// Register a new seller
export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      businessName,
      businessType,
      nationalID,
      bankAccounts,
      wallets,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !businessName ||
      !businessType ||
      !nationalID
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          fullName: !fullName,
          email: !email,
          password: !password,
          businessName: !businessName,
          businessType: !businessType,
          nationalID: !nationalID,
        },
      });
    }

    // Validate that at least one payment method is provided
    if (
      (!bankAccounts || bankAccounts.length === 0) &&
      (!wallets || wallets.length === 0)
    ) {
      return res.status(400).json({
        message:
          "At least one payment method (bank account or wallet) is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate business type
    const validBusinessTypes = [
      "sportswear_manufacturer",
      "sportswear_retailer",
      "custom_clothing_designer",
      "sports_accessories",
      "fitness_apparel",
      "team_uniform_supplier",
      "sports_equipment_retailer",
      "custom_printing_service",
      "sports_footwear",
      "sports_gear_retailer",
    ];
    if (!validBusinessTypes.includes(businessType)) {
      return res.status(400).json({
        message: "Invalid business type",
        validTypes: validBusinessTypes,
        description:
          "Business type must be related to sports clothing, customization, or sports equipment",
      });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new seller
    const seller = new Seller({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "seller",
      businessInfo: {
        businessName,
        businessType,
        nationalID,
      },
      bankAccounts: bankAccounts || [],
      wallets: wallets || [],
      status: "pending", // New sellers start with pending status
      verificationStatus: {
        email: false,
        phone: false,
        documents: false,
      },
    });

    await seller.save();

    // Create JWT token
    const token = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Seller registered successfully",
      token,
      user: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        role: seller.role,
        businessInfo: seller.businessInfo,
        status: seller.status,
        verificationStatus: seller.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering seller",
      error: error.message,
    });
  }
};

// Login seller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if seller is approved
    if (seller.status !== "approved") {
      return res.status(403).json({
        message: "Your account is pending approval",
        status: seller.status,
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        role: seller.role,
        businessInfo: seller.businessInfo,
        status: seller.status,
        verificationStatus: seller.verificationStatus,
      },
      redirectTo: "/seller/dashboard", // Add redirect path
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Get seller profile
export const getProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update seller profile
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      businessName,
      businessType,
      bankAccounts,
      wallets,
    } = req.body;
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update fields
    if (fullName) seller.fullName = fullName;
    if (phoneNumber) seller.phoneNumber = phoneNumber;
    if (businessName) seller.businessInfo.businessName = businessName;
    if (businessType) seller.businessInfo.businessType = businessType;
    if (bankAccounts) seller.bankAccounts = bankAccounts;
    if (wallets) seller.wallets = wallets;

    await seller.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        role: seller.role,
        businessInfo: seller.businessInfo,
        status: seller.status,
        verificationStatus: seller.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get seller's product count
export const getProductCount = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const count = await Product.countDocuments({ seller: sellerId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Error getting product count",
      error: error.message,
    });
  }
};

// Get seller dashboard data
export const getDashboardData = async (req, res) => {
  try {
    // Log the entire request object for debugging
    console.log("Request user:", req.user);
    console.log("Request headers:", req.headers);

    if (!req.user || !req.user.id) {
      console.error("No user ID found in request");
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const sellerId = req.user.id;
    console.log("Getting dashboard data for seller:", sellerId);

    // Verify seller exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      console.error("Seller not found:", sellerId);
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Get product count with error handling
    let productCount;
    try {
      productCount = await Product.countDocuments({ seller: sellerId });
      console.log("Product count:", productCount);
    } catch (error) {
      console.error("Error counting products:", error);
      throw new Error("Failed to count products");
    }

    // Get products with error handling
    let products;
    try {
      products = await Product.find({ seller: sellerId });
      console.log("Found products:", products.length);
    } catch (error) {
      console.error("Error finding products:", error);
      throw new Error("Failed to find products");
    }

    // Calculate total stock with error handling
    let totalStock = 0;
    try {
      totalStock = products.reduce((sum, product) => {
        // Only use variant stock to prevent double counting
        if (product.variants && product.variants.stockByVariant) {
          const variantStock = product.variants.stockByVariant.reduce(
            (variantSum, variant) => {
              return variantSum + (variant.stock || 0);
            },
            0
          );
          return sum + variantStock;
        }
        return sum;
      }, 0);
      console.log("Total stock:", totalStock);
    } catch (error) {
      console.error("Error calculating total stock:", error);
      throw new Error("Failed to calculate total stock");
    }

    res.json({
      success: true,
      productCount,
      totalStock,
      // Add more stats as needed
    });
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    res.status(500).json({
      success: false,
      message: "Error getting dashboard data",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get seller's products
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;
    console.log("Getting products for seller:", sellerId);

    const products = await Product.find({ seller: sellerId })
      .select("-__v")
      .sort({ createdAt: -1 });

    console.log(`Found ${products.length} products for seller`);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error getting seller products:", error);
    res.status(500).json({
      success: false,
      message: "Error getting seller products",
      error: error.message,
    });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { productData } = req.body;
    const parsedProductData = JSON.parse(productData);

    // Validate seller exists
    const seller = await Seller.findById(req.user.id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Handle image uploads
    const images = req.files ? req.files.map((file) => file.path) : [];

    // Create new product with seller information
    const product = new Product({
      ...parsedProductData,
      images,
      seller: req.user.id, // Ensure seller ID is set
      status: "pending",
    });

    // Save product
    await product.save();

    // Add product to seller's products array
    seller.products.push(product._id);
    await seller.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller orders
export const getSellerOrders = async (req, res) => {
  try {
    res.status(200).json({ message: "Get seller orders" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller dashboard data
export const getSellerDashboard = async (req, res) => {
  try {
    res.status(200).json({ message: "Get seller dashboard data" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user.id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json(seller);
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update seller profile
export const updateSellerProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, businessInfo, bankAccounts, wallets } =
      req.body;
    const seller = await Seller.findById(req.user.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Update fields if provided
    if (fullName) seller.fullName = fullName;
    if (phoneNumber) seller.phoneNumber = phoneNumber;
    if (businessInfo) {
      if (businessInfo.businessName)
        seller.businessInfo.businessName = businessInfo.businessName;
      if (businessInfo.businessType)
        seller.businessInfo.businessType = businessInfo.businessType;
    }
    if (bankAccounts) seller.bankAccounts = bankAccounts;
    if (wallets) seller.wallets = wallets;

    await seller.save();

    res.json({
      message: "Profile updated successfully",
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        businessInfo: seller.businessInfo,
        bankAccounts: seller.bankAccounts,
        wallets: seller.wallets,
        status: seller.status,
        verificationStatus: seller.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Error updating seller profile:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get seller profile by ID (public access)
export const getSellerProfileById = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "Seller ID is required",
      });
    }

    const seller = await Seller.findById(sellerId)
      .select("fullName businessInfo status bankAccounts wallets")
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Return info needed for payment processing
    res.json({
      success: true,
      fullName: seller.fullName,
      businessInfo: seller.businessInfo,
      status: seller.status,
      bankAccounts: seller.bankAccounts || [],
      wallets: seller.wallets || [],
    });
  } catch (error) {
    console.error("Error fetching seller profile by ID:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching seller profile",
      error: error.message,
    });
  }
};
