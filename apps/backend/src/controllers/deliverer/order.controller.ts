import {Request, Response} from "express";
import Order from "../../models/order";

export const getDelivererOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "deliverer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for deliverer"});
    }

    const orders = await Order.find({
      assignedHandler: req.user.id,
      assignedHandlerRole: "deliverer",
    })
      .populate("buyer", "firstName middleName lastName email phone")
      .populate("items.product")
      .sort({createdAt: -1});

    res.json(orders);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const markDelivererOrderDelivered = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "deliverer") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for deliverer"});
    }

    const {id} = req.params;
    const {deliveryEvidenceImage} = req.body;
    if (!deliveryEvidenceImage) {
      return res.status(400).json({error: "Delivery evidence image is required"});
    }

    const order = await Order.findOne({
      _id: id,
      assignedHandler: req.user.id,
      assignedHandlerRole: "deliverer",
    });
    if (!order) return res.status(404).json({error: "Order not found"});
    if (order.status === "delivered") {
      return res.status(400).json({error: "Order is already delivered"});
    }
    if (order.status !== "shipped") {
      return res
        .status(400)
        .json({error: "Only shipped orders can be marked as delivered"});
    }

    order.status = "delivered";
    order.deliveredAt = new Date();
    order.deliveryEvidenceImage = deliveryEvidenceImage;
    await order.save();
    res.json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

