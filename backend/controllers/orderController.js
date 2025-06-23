import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import Payout from "../models/Payout.js";
import Cart from "../models/Cart.js";

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD-${timestamp}-${random}`;
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      cartItems, // Array of items grouped by seller
      shippingAddress,
      billingAddress,
      totalAmount,
      subtotal,
      paymentMethod,
    } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Payment screenshot is required" });
    }

    const buyerId = req.user.id;
    const paymentScreenshot = req.file.path;

    // Validate required fields
    if (!cartItems || !shippingAddress || !billingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate buyer exists
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Parse cart items grouped by seller
    let parsedCartItems;
    try {
      parsedCartItems =
        typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid cart items data format" });
    }

    if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart items array is required and cannot be empty" });
    }

    // Validate each seller's items
    for (const sellerGroup of parsedCartItems) {
      if (
        !sellerGroup.sellerId ||
        !sellerGroup.items ||
        !Array.isArray(sellerGroup.items)
      ) {
        return res.status(400).json({
          message: "Each seller group must have sellerId and items array",
        });
      }

      if (sellerGroup.items.length === 0) {
        return res.status(400).json({
          message: "Each seller must have at least one item",
        });
      }

      // Validate each item in the seller group
      for (const item of sellerGroup.items) {
        if (!item.product || !item.quantity || !item.price) {
          return res.status(400).json({
            message: "Each item must have product, quantity, and price",
          });
        }
        if (item.quantity < 1) {
          return res
            .status(400)
            .json({ message: "Item quantity must be at least 1" });
        }
        if (item.price < 0) {
          return res
            .status(400)
            .json({ message: "Item price cannot be negative" });
        }
      }
    }

    // Validate addresses
    let parsedShippingAddress, parsedBillingAddress;
    try {
      parsedShippingAddress =
        typeof shippingAddress === "string"
          ? JSON.parse(shippingAddress)
          : shippingAddress;
      parsedBillingAddress =
        typeof billingAddress === "string"
          ? JSON.parse(billingAddress)
          : billingAddress;
    } catch (error) {
      return res.status(400).json({ message: "Invalid address data format" });
    }

    const requiredAddressFields = [
      "street",
      "city",
      "state",
      "country",
      "zipCode",
      "phone",
    ];
    for (const field of requiredAddressFields) {
      if (!parsedShippingAddress[field] || !parsedBillingAddress[field]) {
        return res
          .status(400)
          .json({ message: `Missing required address field: ${field}` });
      }
    }

    // Create seller orders array
    const sellerOrders = [];
    const sellerPayments = [];
    let calculatedTotalSubtotal = 0;

    for (let i = 0; i < parsedCartItems.length; i++) {
      const sellerGroup = parsedCartItems[i];

      // Check if sellerId is an admin ID
      const admin = await Admin.findById(sellerGroup.sellerId);
      let seller = null;

      if (admin) {
        // This is an admin order, use admin as seller
        seller = {
          _id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          businessInfo: { businessName: "SportWearXpress" },
        };
      } else {
        // This is a regular seller order, validate seller exists
        seller = await Seller.findById(sellerGroup.sellerId);
        if (!seller) {
          return res
            .status(404)
            .json({ message: `Seller ${sellerGroup.sellerId} not found` });
        }
      }

      // Calculate seller order totals
      const sellerSubtotal = sellerGroup.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingCost = 10; // Fixed shipping cost per seller
      const sellerTax = sellerSubtotal * 0.05; // 5% tax
      const sellerTotal = sellerSubtotal + shippingCost + sellerTax;

      calculatedTotalSubtotal += sellerSubtotal;

      // Create seller order
      const sellerOrder = {
        seller: sellerGroup.sellerId,
        items: sellerGroup.items,
        subtotal: sellerSubtotal,
        shippingCost: shippingCost,
        tax: sellerTax,
        totalAmount: sellerTotal,
        status: "pending",
        shippingInfo: {
          method: "standard",
          status: "pending",
        },
        timeline: [
          {
            status: "pending",
            date: new Date(),
            note: "Order created",
          },
        ],
      };

      sellerOrders.push(sellerOrder);

      // Create seller payment record
      const sellerPayment = {
        sellerId: sellerGroup.sellerId,
        sellerOrderIndex: i,
        amount: sellerTotal,
        paymentScreenshot: paymentScreenshot,
        paidToBankAccount: sellerGroup.paidToBankAccount || "",
        paidToWallet: sellerGroup.paidToWallet || "",
        confirmed: false,
        status: "pending",
      };

      sellerPayments.push(sellerPayment);
    }

    // Validate total amounts
    const calculatedTotal =
      calculatedTotalSubtotal +
      sellerOrders.length * 10 +
      calculatedTotalSubtotal * 0.05;

    if (Math.abs(calculatedTotalSubtotal - parseFloat(subtotal)) > 0.01) {
      return res.status(400).json({ message: "Subtotal calculation mismatch" });
    }

    if (Math.abs(calculatedTotal - parseFloat(totalAmount)) > 0.01) {
      return res
        .status(400)
        .json({ message: "Total amount calculation mismatch" });
    }

    // Create payment record with multiple seller payments
    const payment = await Payment.create({
      buyerId,
      orderId: null, // Will be updated after order creation
      sellerPayments,
      status: "pending",
      totalAmount: calculatedTotal,
      paidAmount: 0,
      paymentMethod: paymentMethod || "bank_transfer",
      paymentDate: new Date(),
    });

    // Create order with validated data
    const order = await Order.create({
      buyer: buyerId,
      sellerOrders,
      totalAmount: calculatedTotal,
      subtotal: calculatedTotalSubtotal,
      shippingAddress: parsedShippingAddress,
      billingAddress: parsedBillingAddress,
      paymentInfo: {
        method: paymentMethod || "bank_transfer",
        status: "pending",
      },
      status: "pending",
      timeline: [
        {
          status: "pending",
          date: new Date(),
          note: "Order created",
        },
      ],
    });

    // Update payment with order ID
    payment.orderId = order._id;
    await payment.save();

    // Update seller orders with payment IDs
    for (let i = 0; i < order.sellerOrders.length; i++) {
      order.sellerOrders[i].paymentId = payment._id;
    }
    await order.save();

    // Populate references for response
    await order.populate([
      { path: "buyer", select: "fullName email" },
      {
        path: "sellerOrders.seller",
        select: "fullName email businessInfo.businessName",
      },
      { path: "sellerOrders.items.product", select: "name price images" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { payment, order },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get buyer's orders
export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const buyer = await Buyer.findById(buyerId).populate({
      path: "orders",
      populate: [
        {
          path: "sellerOrders.seller",
          select: "fullName email businessInfo.businessName",
        },
        { path: "sellerOrders.items.product", select: "name price images" },
        { path: "sellerOrders.paymentId" },
      ],
      options: { sort: { createdAt: -1 } },
    });

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    // Process orders to handle admin sellers
    const processedOrders = await Promise.all(
      buyer.orders.map(async (order) => {
        // Process each seller order to handle admin sellers
        const processedSellerOrders = await Promise.all(
          order.sellerOrders.map(async (sellerOrder) => {
            // Check if seller is an admin
            const admin = await Admin.findById(sellerOrder.seller._id);
            if (admin) {
              // Replace seller info with admin info
              sellerOrder.seller = {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                businessInfo: { businessName: "SportWearXpress" },
              };
            }
            return sellerOrder;
          })
        );

        order.sellerOrders = processedSellerOrders;
        return order;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Buyer orders retrieved successfully",
      data: { orders: processedOrders },
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get seller's orders
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Find orders that contain this seller's items
    const orders = await Order.find({
      "sellerOrders.seller": sellerId,
    })
      .populate([
        { path: "buyer", select: "fullName email" },
        {
          path: "sellerOrders.seller",
          select: "fullName email businessInfo.businessName",
        },
        { path: "sellerOrders.items.product", select: "name price images" },
        { path: "sellerOrders.paymentId" },
      ])
      .sort({ createdAt: -1 });

    // Process orders to show only this seller's data
    const sellerOrders = orders
      .map((order) => {
        // Find this seller's order data
        const sellerOrderIndex = order.sellerOrders.findIndex(
          (so) => so.seller._id.toString() === sellerId
        );

        if (sellerOrderIndex === -1) {
          return null; // This shouldn't happen, but just in case
        }

        const sellerOrder = order.sellerOrders[sellerOrderIndex];

        // Create a simplified order object with only this seller's data
        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          buyer: order.buyer,
          seller: sellerOrder.seller,
          items: sellerOrder.items,
          subtotal: sellerOrder.subtotal,
          shippingCost: sellerOrder.shippingCost,
          tax: sellerOrder.tax,
          totalAmount: sellerOrder.totalAmount,
          status: sellerOrder.status,
          shippingInfo: sellerOrder.shippingInfo,
          timeline: sellerOrder.timeline,
          paymentId: sellerOrder.paymentId,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          // Include overall order info for context
          overallOrderStatus: order.status,
          overallOrderNumber: order.orderNumber,
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          // Include payment status for this seller
          paymentStatus: sellerOrder.paymentId ? "pending" : "not_created",
          // Include payout info if exists
          payoutId: sellerOrder.payoutId,
        };
      })
      .filter(Boolean); // Remove any null entries

    return res.status(200).json({
      success: true,
      message: "Seller orders retrieved successfully",
      data: { orders: sellerOrders },
    });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId).populate([
      { path: "buyer", select: "fullName email" },
      {
        path: "sellerOrders.seller",
        select: "fullName email businessInfo.businessName",
      },
      { path: "sellerOrders.items.product", select: "name price images" },
      { path: "sellerOrders.paymentId" },
    ]);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Process seller orders to handle admin sellers
    const processedSellerOrders = await Promise.all(
      order.sellerOrders.map(async (sellerOrder) => {
        // Check if seller is an admin
        const admin = await Admin.findById(sellerOrder.seller._id);
        if (admin) {
          // Replace seller info with admin info
          sellerOrder.seller = {
            _id: admin._id,
            fullName: admin.fullName,
            email: admin.email,
            businessInfo: { businessName: "SportWearXpress" },
          };
        }
        return sellerOrder;
      })
    );

    order.sellerOrders = processedSellerOrders;

    // Check if user has permission to view this order
    if (userRole === "buyer" && order.buyer._id.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (userRole === "seller") {
      // Check if this seller has any items in this order
      const hasItems = order.sellerOrders.some(
        (sellerOrder) => sellerOrder.seller._id.toString() === userId
      );
      if (!hasItems) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update order status (for sellers)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, sellerOrderIndex } = req.body;
    const sellerId = req.user.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the seller's order index if not provided
    let targetSellerOrderIndex = sellerOrderIndex;
    if (targetSellerOrderIndex === undefined) {
      targetSellerOrderIndex = order.sellerOrders.findIndex(
        (sellerOrder) => sellerOrder.seller.toString() === sellerId
      );
    }

    if (targetSellerOrderIndex === -1) {
      return res.status(404).json({ message: "Seller order not found" });
    }

    const sellerOrder = order.sellerOrders[targetSellerOrderIndex];

    // Verify this seller owns this order
    if (sellerOrder.seller.toString() !== sellerId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update seller order status
    await order.updateSellerOrderStatus(
      targetSellerOrderIndex,
      status,
      note,
      sellerId
    );

    // Check if all seller orders are delivered and update overall order status
    if (order.areAllSellerOrdersDelivered()) {
      await order.updateStatus("delivered", "All items delivered", sellerId);
    }

    // If order is marked as delivered, automatically create payout
    if (status === "delivered") {
      try {
        // Get admin ID (assuming there's only one admin)
        const admin = await Admin.findOne();
        if (!admin) {
          console.error("No admin found for payout creation");
        } else {
          // Check if payout already exists for this seller order
          const existingPayout = await Payout.findOne({
            orderId: order._id,
            sellerId: sellerId,
            sellerOrderIndex: targetSellerOrderIndex,
          });

          if (!existingPayout) {
            // Create payout for this seller order
            const payout = new Payout({
              orderId: order._id,
              buyerId: order.buyer,
              sellerId: sellerId,
              adminId: admin._id,
              sellerOrderIndex: targetSellerOrderIndex,
              orderAmount: sellerOrder.totalAmount,
              commissionRate: 0.02, // 2% commission
            });

            await payout.save();

            // Update the seller order with payout ID
            order.sellerOrders[targetSellerOrderIndex].payoutId = payout._id;
            await order.save();

            console.log(
              `Payout created for seller ${sellerId} in order ${orderId}`
            );
          } else {
            console.log(
              `Payout already exists for seller ${sellerId} in order ${orderId}`
            );
          }
        }
      } catch (payoutError) {
        console.error("Error creating payout:", payoutError);
        // Don't fail the order update if payout creation fails
      }
    }

    // Populate for response
    await order.populate([
      { path: "buyer", select: "fullName email" },
      {
        path: "sellerOrders.seller",
        select: "fullName email businessInfo.businessName",
      },
      { path: "sellerOrders.items.product", select: "name price images" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get order statistics for dashboard
export const getOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === "buyer") {
      const buyer = await Buyer.findById(userId);
      if (!buyer) {
        return res.status(404).json({ message: "Buyer not found" });
      }

      const orders = await Order.find({ buyer: userId });

      stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        processingOrders: orders.filter((o) => o.status === "processing")
          .length,
        shippedOrders: orders.filter((o) => o.status === "shipped").length,
        deliveredOrders: orders.filter((o) => o.status === "delivered").length,
        cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
        totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      };
    } else if (userRole === "seller") {
      const seller = await Seller.findById(userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }

      const orders = await Order.find({ seller: userId });

      stats = {
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        processingOrders: orders.filter((o) => o.status === "processing")
          .length,
        shippedOrders: orders.filter((o) => o.status === "shipped").length,
        deliveredOrders: orders.filter((o) => o.status === "delivered").length,
        cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
        totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
        averageOrderValue:
          orders.length > 0
            ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
            : 0,
      };
    }

    return res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Create order from cart - NEW OPTIMIZED VERSION
export const createOrderFromCart = async (req, res) => {
  try {
    const { cartItems, shippingAddress, billingAddress } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required",
      });
    }

    const buyerId = req.user.id;
    const paymentScreenshot = req.file.path;

    // Validate required fields
    if (!cartItems || !shippingAddress || !billingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: cartItems, shippingAddress, billingAddress",
      });
    }

    // Validate buyer exists
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: "Buyer not found",
      });
    }

    // Parse cart items
    let parsedCartItems;
    try {
      parsedCartItems =
        typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart items data format",
      });
    }

    if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items array is required and cannot be empty",
      });
    }

    // Parse addresses
    let parsedShippingAddress, parsedBillingAddress;
    try {
      parsedShippingAddress =
        typeof shippingAddress === "string"
          ? JSON.parse(shippingAddress)
          : shippingAddress;
      parsedBillingAddress =
        typeof billingAddress === "string"
          ? JSON.parse(billingAddress)
          : billingAddress;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid address data format",
      });
    }

    // Validate addresses
    const requiredAddressFields = [
      "street",
      "city",
      "state",
      "country",
      "zipCode",
      "phone",
    ];
    for (const field of requiredAddressFields) {
      if (!parsedShippingAddress[field] || !parsedBillingAddress[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required address field: ${field}`,
        });
      }
    }

    // Validate each seller group
    for (const sellerGroup of parsedCartItems) {
      if (
        !sellerGroup.sellerId ||
        !sellerGroup.items ||
        !Array.isArray(sellerGroup.items)
      ) {
        return res.status(400).json({
          success: false,
          message: "Each seller group must have sellerId and items array",
        });
      }

      if (sellerGroup.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Each seller must have at least one item",
        });
      }

      // Validate each item
      for (const item of sellerGroup.items) {
        if (!item.product || !item.quantity || !item.price) {
          return res.status(400).json({
            success: false,
            message: "Each item must have product, quantity, and price",
          });
        }
        if (item.quantity < 1) {
          return res.status(400).json({
            success: false,
            message: "Item quantity must be at least 1",
          });
        }
        if (item.price <= 0) {
          return res.status(400).json({
            success: false,
            message: "Item price must be greater than 0",
          });
        }
      }
    }

    // Create seller orders and validate products
    const sellerOrders = [];
    const sellerPayments = [];
    let totalSubtotal = 0;
    let totalShipping = 0;
    let totalTax = 0;

    for (let i = 0; i < parsedCartItems.length; i++) {
      const sellerGroup = parsedCartItems[i];
      const sellerId = sellerGroup.sellerId;

      // Check if seller exists (admin or regular seller)
      let seller = await Admin.findById(sellerId);
      let isAdmin = false;

      if (seller) {
        isAdmin = true;
      } else {
        seller = await Seller.findById(sellerId);
        if (!seller) {
          return res.status(404).json({
            success: false,
            message: `Seller ${sellerId} not found`,
          });
        }
      }

      // Validate products and check stock
      const validatedItems = [];
      let sellerSubtotal = 0;

      for (const item of sellerGroup.items) {
        // Find product and validate
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.product} not found`,
          });
        }

        if (!product.isActive || product.status !== "approved") {
          return res.status(400).json({
            success: false,
            message: `Product ${product.name} is not available for purchase`,
          });
        }

        // Check stock availability
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          });
        }

        // Validate seller ownership
        if (product.seller.toString() !== sellerId) {
          return res.status(400).json({
            success: false,
            message: `Product ${product.name} does not belong to seller ${sellerId}`,
          });
        }

        validatedItems.push({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          variant: {
            color: item.color || null,
            size: item.size || null,
          },
          status: "pending",
        });

        sellerSubtotal += item.price * item.quantity;
      }

      // Calculate seller order totals
      const shippingCost = 10; // Fixed shipping cost per seller
      const sellerTax = sellerSubtotal * 0.05; // 5% tax
      const sellerTotal = sellerSubtotal + shippingCost + sellerTax;

      totalSubtotal += sellerSubtotal;
      totalShipping += shippingCost;
      totalTax += sellerTax;

      // Create seller order
      const sellerOrder = {
        seller: sellerId,
        items: validatedItems,
        subtotal: sellerSubtotal,
        shippingCost: shippingCost,
        tax: sellerTax,
        totalAmount: sellerTotal,
        status: "pending",
        shippingInfo: {
          method: "standard",
          status: "pending",
        },
        timeline: [
          {
            status: "pending",
            date: new Date(),
            note: "Order created",
          },
        ],
      };

      sellerOrders.push(sellerOrder);

      // Create seller payment record
      const sellerPayment = {
        sellerId: sellerId,
        sellerOrderIndex: i,
        amount: sellerTotal,
        paymentScreenshot: paymentScreenshot,
        paidToBankAccount: sellerGroup.paidToBankAccount || "",
        paidToWallet: sellerGroup.paidToWallet || "",
        confirmed: false,
        status: "pending",
      };

      sellerPayments.push(sellerPayment);
    }

    const grandTotal = totalSubtotal + totalShipping + totalTax;

    // Create payment record
    const payment = await Payment.create({
      buyerId,
      orderId: null, // Will be updated after order creation
      sellerPayments,
      status: "pending",
      totalAmount: grandTotal,
      paidAmount: 0,
      paymentMethod: "bank_transfer",
      paymentDate: new Date(),
    });

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      buyer: buyerId,
      sellerOrders,
      totalAmount: grandTotal,
      subtotal: totalSubtotal,
      shippingAddress: parsedShippingAddress,
      billingAddress: parsedBillingAddress,
      paymentInfo: {
        method: "bank_transfer",
        status: "pending",
      },
      status: "pending",
      timeline: [
        {
          status: "pending",
          date: new Date(),
          note: "Order created from cart",
        },
      ],
    });

    // Update payment with order ID
    payment.orderId = order._id;
    await payment.save();

    // Update seller orders with payment IDs
    for (let i = 0; i < order.sellerOrders.length; i++) {
      order.sellerOrders[i].paymentId = payment._id;
    }
    await order.save();

    // REDUCE PRODUCT STOCK - CRITICAL STEP
    for (const sellerGroup of parsedCartItems) {
      for (const item of sellerGroup.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // Clear the cart after successful order creation
    const cart = await Cart.findOne({ user: buyerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Populate references for response
    await order.populate([
      { path: "buyer", select: "fullName email" },
      {
        path: "sellerOrders.seller",
        select: "fullName email businessInfo.businessName",
      },
      { path: "sellerOrders.items.product", select: "name price images" },
    ]);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
        payment,
        orderNumber,
        totalAmount: grandTotal,
      },
    });
  } catch (error) {
    console.error("Error creating order from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get seller-specific order details
export const getSellerOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user.id;

    const order = await Order.findById(orderId).populate([
      { path: "buyer", select: "fullName email" },
      {
        path: "sellerOrders.seller",
        select: "fullName email businessInfo.businessName",
      },
      { path: "sellerOrders.items.product", select: "name price images" },
      { path: "sellerOrders.paymentId" },
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find this seller's order data
    const sellerOrderIndex = order.sellerOrders.findIndex(
      (sellerOrder) => sellerOrder.seller._id.toString() === sellerId
    );

    if (sellerOrderIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "Access denied - Order not found for this seller",
      });
    }

    const sellerOrder = order.sellerOrders[sellerOrderIndex];

    // Create seller-specific order object
    const sellerOrderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      buyer: order.buyer,
      seller: sellerOrder.seller,
      items: sellerOrder.items,
      subtotal: sellerOrder.subtotal,
      shippingCost: sellerOrder.shippingCost,
      tax: sellerOrder.tax,
      totalAmount: sellerOrder.totalAmount,
      status: sellerOrder.status,
      shippingInfo: sellerOrder.shippingInfo,
      timeline: sellerOrder.timeline,
      paymentId: sellerOrder.paymentId,
      payoutId: sellerOrder.payoutId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      // Overall order context
      overallOrderStatus: order.status,
      overallOrderNumber: order.orderNumber,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      // Payment and payout status
      paymentStatus: sellerOrder.paymentId ? "pending" : "not_created",
      payoutStatus: sellerOrder.payoutId ? "pending" : "not_created",
    };

    return res.status(200).json({
      success: true,
      message: "Seller order details retrieved successfully",
      data: { order: sellerOrderData },
    });
  } catch (error) {
    console.error("Error fetching seller order details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
