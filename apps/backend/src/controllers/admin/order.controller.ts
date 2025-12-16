// controllers/admin/order.controller.ts
import {Request, Response} from "express";
import Order from "../../models/order";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {status, page = 1, limit = 20} = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate("buyer", "name email")
      .populate("items.product")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {id} = req.params;
    const {status, trackingNumber} = req.body;

    if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({error: "Valid status is required"});
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({error: "Order not found"});
    }

    order.status = status as any;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    await order.populate("items.product");

    // TODO: Send status update email

    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

