import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin"],
  },
  bankAccounts: [
    {
      type: {
        type: String,
        enum: ["Allied Bank", "HBL", "Al-Falah", "Faysal Bank", "MCB", "other"],
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      accountTitle: {
        type: String,
        required: true,
        trim: true,
      },
      branchCode: {
        type: String,
        trim: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
      otherBankName: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return (
              this.type !== "other" ||
              (this.type === "other" && v && v.length > 0)
            );
          },
          message: "Bank name is required when type is 'other'",
        },
      },
    },
  ],
  wallets: [
    {
      type: {
        type: String,
        enum: ["jazz cash", "easyPaisa", "other"],
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      accountTitle: {
        type: String,
        required: true,
        trim: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
      otherWalletName: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return (
              this.type !== "other" ||
              (this.type === "other" && v && v.length > 0)
            );
          },
          message: "Wallet name is required when type is 'other'",
        },
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  // Commission and financial tracking
  commissionBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCommissions: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalPayouts: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Commission history
  commissionHistory: [
    {
      payoutId: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
      },
      status: {
        type: String,
        enum: ["earned", "withdrawn"],
        default: "earned",
      },
    },
  ],
});

// Validate unique account numbers across both bank accounts and wallets
adminSchema.pre("save", function (next) {
  const allAccountNumbers = [
    ...this.bankAccounts.map((acc) => acc.accountNumber),
    ...this.wallets.map((wallet) => wallet.accountNumber),
  ];

  const uniqueAccountNumbers = new Set(allAccountNumbers);

  if (allAccountNumbers.length !== uniqueAccountNumbers.size) {
    next(
      new Error("Account numbers must be unique across all payment methods")
    );
  }

  next();
});

// Update the updatedAt timestamp before saving
adminSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a bank account
adminSchema.methods.addBankAccount = async function (bankAccount) {
  // Check if account number already exists in any payment method
  const existingAccount = await this.constructor.findOne({
    $or: [
      { "bankAccounts.accountNumber": bankAccount.accountNumber },
      { "wallets.accountNumber": bankAccount.accountNumber },
    ],
  });

  if (existingAccount) {
    throw new Error("Account number already exists in another payment method");
  }

  // If this is the first account or marked as default, unset other defaults
  if (bankAccount.isDefault || this.bankAccounts.length === 0) {
    await this.updateMany(
      { "bankAccounts.$[].isDefault": true },
      { $set: { "bankAccounts.$[].isDefault": false } }
    );
  }
  this.bankAccounts.push(bankAccount);
  return this.save();
};

// Method to add a wallet
adminSchema.methods.addWallet = async function (wallet) {
  // Check if account number already exists in any payment method
  const existingAccount = await this.constructor.findOne({
    $or: [
      { "bankAccounts.accountNumber": wallet.accountNumber },
      { "wallets.accountNumber": wallet.accountNumber },
    ],
  });

  if (existingAccount) {
    throw new Error("Account number already exists in another payment method");
  }

  // If this is the first wallet or marked as default, unset other defaults
  if (wallet.isDefault || this.wallets.length === 0) {
    await this.updateMany(
      { "wallets.$[].isDefault": true },
      { $set: { "wallets.$[].isDefault": false } }
    );
  }
  this.wallets.push(wallet);
  return this.save();
};

// Method to set default bank account
adminSchema.methods.setDefaultBankAccount = async function (accountId) {
  const account = this.bankAccounts.id(accountId);
  if (!account) {
    throw new Error("Bank account not found");
  }

  // Unset all defaults
  this.bankAccounts.forEach((acc) => (acc.isDefault = false));

  // Set new default
  account.isDefault = true;
  return this.save();
};

// Method to set default wallet
adminSchema.methods.setDefaultWallet = async function (walletId) {
  const wallet = this.wallets.id(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Unset all defaults
  this.wallets.forEach((w) => (w.isDefault = false));

  // Set new default
  wallet.isDefault = true;
  return this.save();
};

// Method to remove bank account
adminSchema.methods.removeBankAccount = async function (accountId) {
  const account = this.bankAccounts.id(accountId);
  if (!account) {
    throw new Error("Bank account not found");
  }

  // If removing default account and there are other accounts, set a new default
  if (account.isDefault && this.bankAccounts.length > 1) {
    const nextAccount = this.bankAccounts.find(
      (acc) => acc._id.toString() !== accountId
    );
    if (nextAccount) {
      nextAccount.isDefault = true;
    }
  }

  this.bankAccounts.pull(accountId);
  return this.save();
};

// Method to remove wallet
adminSchema.methods.removeWallet = async function (walletId) {
  const wallet = this.wallets.id(walletId);
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // If removing default wallet and there are other wallets, set a new default
  if (wallet.isDefault && this.wallets.length > 1) {
    const nextWallet = this.wallets.find((w) => w._id.toString() !== walletId);
    if (nextWallet) {
      nextWallet.isDefault = true;
    }
  }

  this.wallets.pull(walletId);
  return this.save();
};

export default mongoose.model("Admin", adminSchema);
