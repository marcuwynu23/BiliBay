import {Request, Response} from "express";
import Product from "../../models/product";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const product = await Product.create({...req.body, seller: req.user.id});
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const getMyProducts = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const products = await Product.find({seller: req.user.id});
    res.json(products);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
