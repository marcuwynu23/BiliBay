import {Request, Response} from "express";
import Order from "../../models/order";
import User from "../../models/user";

export const getCourierOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "courier") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for courier"});
    }

    const orders = await Order.find({
      assignedHandler: req.user.id,
      assignedHandlerRole: "courier",
    })
      .populate("buyer", "firstName middleName lastName email phone")
      .populate("items.product")
      .sort({createdAt: -1});

    res.json(orders);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const markCourierOrderShipped = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "courier") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for courier"});
    }

    const {id} = req.params;
    const {delivererId} = req.body;
    if (!delivererId) {
      return res
        .status(400)
        .json({error: "delivererId is required for local area handoff"});
    }

    const deliverer = await User.findById(delivererId);
    if (!deliverer || deliverer.role !== "deliverer" || !deliverer.isActive) {
      return res.status(400).json({error: "Invalid deliverer account"});
    }

    const order = await Order.findOne({
      _id: id,
      assignedHandler: req.user.id,
      assignedHandlerRole: "courier",
    });
    if (!order) return res.status(404).json({error: "Order not found"});
    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({error: "Order is already shipped/delivered"});
    }

    order.status = "shipped";
    order.shippedAt = new Date();
    order.assignedHandler = deliverer._id as any;
    order.assignedHandlerRole = "deliverer";
    await order.save();
    await order.populate("assignedHandler", "firstName middleName lastName email role");
    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const getDeliverersForCourier = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "courier") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for courier"});
    }

    const deliverers = await User.find({
      role: "deliverer",
      isActive: true,
    }).select("firstName middleName lastName email role");

    res.json(deliverers);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

