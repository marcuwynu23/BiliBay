import {Request, Response} from "express";
import Category from "../../models/category";

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const getSellerCategories = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res.status(403).json({error: "Forbidden: Seller access required"});
    }

    const categories = await Category.find().sort({name: 1});
    res.json(categories);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const createSellerCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res.status(403).json({error: "Forbidden: Seller access required"});
    }

    const {name, description} = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({error: "Category name is required"});
    }

    const trimmedName = String(name).trim();
    const category = await Category.create({
      name: trimmedName,
      slug: toSlug(trimmedName),
      description: description ? String(description).trim() : undefined,
    });

    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({error: "Category already exists"});
    }
    res.status(400).json({error: err.message});
  }
};

export const updateSellerCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res.status(403).json({error: "Forbidden: Seller access required"});
    }

    const {id} = req.params;
    const {name, description} = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({error: "Category not found"});
    }

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({error: "Category name is required"});
      }
      category.name = trimmedName;
      category.slug = toSlug(trimmedName);
    }

    if (description !== undefined) {
      category.description = String(description).trim();
    }

    await category.save();
    res.json(category);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({error: "Category already exists"});
    }
    res.status(400).json({error: err.message});
  }
};

export const deleteSellerCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "seller") {
      return res.status(403).json({error: "Forbidden: Seller access required"});
    }

    const {id} = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({error: "Category not found"});
    }

    const Product = (await import("../../models/product")).default;
    const productCount = await Product.countDocuments({category: id});
    if (productCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. It is used by ${productCount} product(s)`,
      });
    }

    await Category.findByIdAndDelete(id);
    res.json({message: "Category deleted successfully"});
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
