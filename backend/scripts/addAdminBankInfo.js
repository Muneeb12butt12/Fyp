import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

const addAdminBankInfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find the admin
    const admin = await Admin.findOne();
    if (!admin) {
      console.log("No admin found. Please create an admin first.");
      return;
    }

    console.log("Found admin:", admin.fullName);

    // Add bank accounts
    const bankAccounts = [
      {
        type: "HBL",
        accountTitle: "SportWearXpress",
        accountNumber: "1234567890",
        branchCode: "001",
        isDefault: true,
      },
      {
        type: "MCB",
        accountTitle: "SportWearXpress",
        accountNumber: "0987654321",
        branchCode: "002",
        isDefault: false,
      },
    ];

    // Add wallets
    const wallets = [
      {
        type: "easyPaisa",
        accountTitle: "SportWearXpress",
        accountNumber: "03001234567",
        isDefault: true,
      },
      {
        type: "jazz cash",
        accountTitle: "SportWearXpress",
        accountNumber: "03009876543",
        isDefault: false,
      },
    ];

    // Update admin with bank and wallet information
    admin.bankAccounts = bankAccounts;
    admin.wallets = wallets;
    await admin.save();

    console.log("Admin bank and wallet information updated successfully!");
    console.log("Bank accounts:", admin.bankAccounts.length);
    console.log("Wallets:", admin.wallets.length);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error adding admin bank info:", error);
    process.exit(1);
  }
};

// Run the script
addAdminBankInfo();
