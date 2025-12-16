// controllers/admin/dashboard.controller.ts
import {Request, Response} from "express";
import Order from "../../models/order";
import User from "../../models/user";
import Product from "../../models/product";
import Payment from "../../models/payment";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total sales (sum of all paid orders)
    const paidOrders = await Order.find({paymentStatus: "paid"});
    const totalSales = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Total users
    const totalUsers = await User.countDocuments();

    // Low stock products (stock < 10)
    const lowStockProducts = await Product.find({
      stock: {$lt: 10},
      status: "available",
    }).countDocuments();

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .populate("buyer", "name email")
      .sort({createdAt: -1})
      .limit(10);

    // Pending payments
    const pendingPayments = await Payment.find({status: "pending"})
      .populate("order")
      .sort({createdAt: -1})
      .limit(10);

    res.json({
      totalOrders,
      totalSales,
      totalUsers,
      lowStockProducts,
      recentOrders,
      pendingPayments,
    });
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

