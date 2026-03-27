import {Request, Response} from "express";
import Order from "../../models/order";
import Product from "../../models/product";
import User from "../../models/user";
import logger from "../../utils/logger";

export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    // Get seller's product IDs
    const sellerProducts = await Product.find({seller: req.user.id}).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    logger.info("Seller orders query", {
      sellerId: req.user.id,
      productCount: productIds.length,
    });

    if (productIds.length === 0) {
      logger.info("No products found for seller, returning empty orders");
      return res.json([]);
    }

    // Find orders that contain seller's products
    // Note: Orders can only contain products from one seller (as per createOrder logic)
    const orders = await Order.find({
      "items.product": {$in: productIds},
    })
      .populate("buyer", "firstName middleName lastName email phone")
      .populate("assignedHandler", "firstName middleName lastName email role")
      .populate({
        path: "items.product",
        populate: {
          path: "seller",
          select: "firstName lastName email",
        },
      })
      .sort({createdAt: -1});

    // Filter to only include orders where all items belong to this seller
    // This ensures we only show orders that are fully from this seller
    const sellerOrders = orders.filter((order) => {
      return order.items.every((item: any) => {
        const itemProductId = typeof item.product === "object" && item.product?._id 
          ? item.product._id.toString() 
          : item.product?.toString();
        return productIds.some((pid) => pid.toString() === itemProductId);
      });
    });

    logger.info("Seller orders retrieved", {
      sellerId: req.user.id,
      orderCount: sellerOrders.length,
    });

    res.json(sellerOrders);
  } catch (err: any) {
    logger.error("Error fetching seller orders", {
      error: err.message,
      stack: err.stack,
      sellerId: req.user?.id,
    });
    res.status(400).json({error: err.message});
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {id} = req.params;

    // Get seller's product IDs
    const sellerProducts = await Product.find({seller: req.user.id}).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    const order = await Order.findById(id)
      .populate("buyer", "firstName middleName lastName email phone")
      .populate("assignedHandler", "firstName middleName lastName email role")
      .populate({
        path: "items.product",
        populate: {
          path: "seller",
          select: "firstName lastName email",
        },
      });

    if (!order) {
      return res.status(404).json({error: "Order not found"});
    }

    // Verify ownership
    const isSellerOrder = order.items.every((item: any) => {
      const itemProductId = typeof item.product === "object" && item.product?._id 
        ? item.product._id.toString() 
        : item.product?.toString();
      return productIds.some((pid) => pid.toString() === itemProductId);
    });

    if (!isSellerOrder) {
      return res.status(403).json({error: "Forbidden: Not your order"});
    }

    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {id} = req.params;
    const {status, trackingNumber} = req.body;

    if (!status || !["pending", "processing"].includes(status)) {
      return res.status(400).json({error: "Valid status is required"});
    }

    // Get seller's product IDs
    const sellerProducts = await Product.find({seller: req.user.id}).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({error: "Order not found"});
    }

    // Verify ownership
    const isSellerOrder = order.items.every((item: any) => {
      const itemProductId = typeof item.product === "object" && item.product?._id 
        ? item.product._id.toString() 
        : item.product?.toString();
      return productIds.some((pid) => pid.toString() === itemProductId);
    });

    if (!isSellerOrder) {
      return res.status(403).json({error: "Forbidden: Not your order"});
    }

    // Validate status transitions
    if (order.status === "cancelled") {
      return res.status(400).json({error: "Cannot update cancelled order"});
    }

    // Seller cannot directly set shipped/delivered
    if (status === "shipped" || status === "delivered") {
      return res.status(403).json({
        error: "Seller is not allowed to set shipped or delivered status",
      });
    }

    if (status === "cancelled") {
      return res
        .status(403)
        .json({error: "Seller is not allowed to cancel buyer orders"});
    }

    order.status = status as any;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    // TODO: Send status update email

    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const getDeliveryHandlers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const handlers = await User.find({
      role: {$in: ["courier", "deliverer"]},
      isActive: true,
    }).select("firstName middleName lastName email role");

    res.json(handlers);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const assignOrderHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {id} = req.params;
    const {handlerId} = req.body;
    if (!handlerId) {
      return res.status(400).json({error: "handlerId is required"});
    }

    const sellerProducts = await Product.find({seller: req.user.id}).select("_id");
    const productIds = sellerProducts.map((p) => p._id.toString());
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({error: "Order not found"});

    const isSellerOrder = order.items.every((item: any) => {
      const itemProductId = item.product?.toString();
      return productIds.includes(itemProductId);
    });
    if (!isSellerOrder) {
      return res.status(403).json({error: "Forbidden: Not your order"});
    }

    const handler = await User.findById(handlerId);
    if (!handler || !["courier", "deliverer"].includes(handler.role)) {
      return res.status(400).json({error: "Invalid delivery handler"});
    }

    order.assignedHandler = handler._id as any;
    order.assignedHandlerRole = handler.role as "courier" | "deliverer";
    if (order.status === "pending") {
      order.status = "processing";
    }
    await order.save();
    await order.populate("assignedHandler", "firstName middleName lastName email role");
    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
