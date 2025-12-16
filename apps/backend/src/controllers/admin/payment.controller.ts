// controllers/admin/payment.controller.ts
import {Request, Response} from "express";
import Payment from "../../models/payment";
import Order from "../../models/order";

export const getPayments = async (req: Request, res: Response) => {
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

    const payments = await Payment.find(query)
      .populate("order")
      .populate("verifiedBy", "name email")
      .sort({createdAt: -1})
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
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

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {id} = req.params;

    const payment = await Payment.findById(id).populate("order");

    if (!payment) {
      return res.status(404).json({error: "Payment not found"});
    }

    if (payment.status === "paid") {
      return res.status(400).json({error: "Payment already verified"});
    }

    payment.status = "paid";
    payment.verifiedBy = req.user.id as any;
    payment.verifiedAt = new Date();

    // Update order payment status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = "paid";
      await order.save();
    }

    await payment.save();
    await payment.populate("order");
    await payment.populate("verifiedBy", "name email");

    // TODO: Send payment confirmation email

    res.json(payment);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

