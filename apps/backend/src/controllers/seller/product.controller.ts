import {Request, Response} from "express";
import Product from "../../models/product";
import mongoose from "mongoose";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {
      title,
      description,
      price,
      category,
      images,
      stock,
      variants,
      specifications,
      status = "draft",
    } = req.body;

    if (!title || !price || stock === undefined) {
      return res.status(400).json({error: "Title, price, and stock are required"});
    }

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category: category ? new mongoose.Types.ObjectId(category) : undefined,
      images: images || [],
      stock: Number(stock),
      variants: variants || [],
      specifications: specifications || {},
      status,
      seller: req.user.id,
    });

    await product.populate("category", "name slug");

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

    const {status} = req.query;

    const query: any = {seller: req.user.id};
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort({createdAt: -1});

    res.json(products);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {id} = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    // Verify ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({error: "Forbidden: Not your product"});
    }

    const updates = req.body;
    if (updates.category) {
      updates.category = new mongoose.Types.ObjectId(updates.category);
    }

    Object.assign(product, updates);
    await product.save();
    await product.populate("category", "name slug");

    res.json(product);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({error: "Forbidden: Access is allowed only for sellers"});
    }

    const {id} = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    // Verify ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({error: "Forbidden: Not your product"});
    }

    await Product.findByIdAndDelete(id);

    res.json({message: "Product deleted successfully"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
