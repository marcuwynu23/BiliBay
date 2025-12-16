// controllers/admin/category.controller.ts
import {Request, Response} from "express";
import Category from "../../models/category";

export const getCategories = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const categories = await Category.find().sort({name: 1});
    res.json(categories);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {name, description} = req.body;

    if (!name) {
      return res.status(400).json({error: "Category name is required"});
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await Category.create({name, slug, description});
    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({error: "Category already exists"});
    }
    res.status(400).json({error: err.message});
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {id} = req.params;
    const {name, description} = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({error: "Category not found"});
    }

    if (name) {
      category.name = name;
      // Regenerate slug if name changed
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    res.json(category);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({error: "Category name already exists"});
    }
    res.status(400).json({error: err.message});
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthorized"});
    if (req.user.role !== "admin") {
      return res.status(403).json({error: "Forbidden: Admin access required"});
    }

    const {id} = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({error: "Category not found"});
    }

    // Check if category is used by products
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

