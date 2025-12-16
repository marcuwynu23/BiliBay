import {Request, Response} from "express";
import Order from "../../models/order";
import Product from "../../models/product";
import Cart from "../../models/cart";
import Payment from "../../models/payment";
import mongoose from "mongoose";

// Generate unique order number
const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Calculate shipping fee (flat rate for now)
const calculateShippingFee = (subtotal: number) => {
  // Free shipping for orders over 50
  if (subtotal >= 50) return 0;
  return 10; // Flat rate
};

export const createOrder = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {
    items, // Array of {productId, quantity, variant}
    shippingAddress,
    paymentMethod,
    paymentReference,
    receiptImage,
  } = req.body;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({error: "Order items are required"});
    }

    if (!shippingAddress) {
      return res.status(400).json({error: "Shipping address is required"});
    }

    if (!paymentMethod || !["cod", "bank_transfer"].includes(paymentMethod)) {
      return res.status(400).json({error: "Valid payment method is required"});
    }

    // Validate and calculate order
    const orderItems = [];
    let subtotal = 0;
    const sellerIds = new Set<string>();

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({error: `Product ${item.productId} not found`});
      }

      if (product.status !== "available") {
        return res.status(400).json({error: `Product ${product.title} is not available`});
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({error: `Insufficient stock for ${product.title}`});
      }

      sellerIds.add(product.seller.toString());
      const itemPrice = product.price * item.quantity;
      subtotal += itemPrice;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        variant: item.variant,
      });
    }

    // V1: Single seller per order (can be extended in V2)
    if (sellerIds.size > 1) {
      return res.status(400).json({error: "Orders can only contain products from one seller"});
    }

    const shippingFee = calculateShippingFee(subtotal);
    const totalAmount = subtotal + shippingFee;

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      buyer: buyerId,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      paymentReference,
      status: "pending",
    });

    // Create payment record
    await Payment.create({
      order: order._id,
      amount: totalAmount,
      method: paymentMethod,
      status: "pending",
      reference: paymentReference,
      receiptImage,
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {stock: -item.quantity},
      });
    }

    // Clear cart
    const cart = await Cart.findOne({buyer: buyerId});
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    await order.populate("items.product");

    // TODO: Send order confirmation email

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const getOrders = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;

  try {
    const orders = await Order.find({buyer: buyerId})
      .populate("items.product")
      .sort({createdAt: -1});

    res.json(orders);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {id} = req.params;

  try {
    const order = await Order.findOne({_id: id, buyer: buyerId}).populate(
      "items.product"
    );

    if (!order) {
      return res.status(404).json({error: "Order not found"});
    }

    const payment = await Payment.findOne({order: order._id});

    res.json({order, payment});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {id} = req.params;
  const {reason} = req.body;

  try {
    const order = await Order.findOne({_id: id, buyer: buyerId});

    if (!order) {
      return res.status(404).json({error: "Order not found"});
    }

    // Can only cancel if not shipped
    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({error: "Cannot cancel order that has been shipped"});
    }

    if (order.status === "cancelled") {
      return res.status(400).json({error: "Order is already cancelled"});
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledReason = reason;

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {stock: item.quantity},
      });
    }

    await order.save();

    // TODO: Send cancellation email

    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
