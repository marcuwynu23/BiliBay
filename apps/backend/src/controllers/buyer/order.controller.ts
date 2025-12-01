import {Request, Response} from "express";
import Order from "../../models/order";
import Product from "../../models/product";

export const createOrder = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({error: "Unauthorized"});
  if (req.user.role !== "buyer") {
    return res
      .status(403)
      .json({error: "Forbidden: Access is allowed only for buyers"});
  }

  const buyerId = req.user.id;
  const {products} = req.body; // array of product IDs

  try {
    let total = 0;
    for (const pid of products) {
      const prod = await Product.findById(pid);
      if (!prod) return res.status(404).json({error: "Product not found"});
      total += prod.price;
      await Product.findByIdAndUpdate(pid, {status: "sold"});
    }

    const order = await Order.create({
      buyer: buyerId,
      seller: products[0].seller,
      products,
      totalAmount: total,
      status: "pending",
    });

    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
