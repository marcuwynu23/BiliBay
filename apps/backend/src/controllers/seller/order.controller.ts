import {Request, Response} from "express";
import Order from "../../models/order";

export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }
    const orders = await Order.find({seller: req.user.id}).populate(
      "buyer products"
    );
    res.json(orders);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
