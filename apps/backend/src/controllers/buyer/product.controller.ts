import {Request, Response} from "express";
import Product from "../../models/product";

// Get all available products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({status: "available"});
    res.json(products);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

// Get a specific product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid product ID"});
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    res.json(product);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
