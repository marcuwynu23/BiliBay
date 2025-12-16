import {Request, Response} from "express";
import Product from "../../models/product";
import Category from "../../models/category";

// Get all available products with search, filter, and sort
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy = "newest", // newest, price_low, price_high, popularity
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {status: "available"};

    // Search
    if (search) {
      query.$text = {$search: search as string};
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({
        $or: [{slug: category}, {_id: category}],
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Stock availability
    if (inStock === "true") {
      query.stock = {$gt: 0};
    }

    // Sorting
    let sort: any = {};
    switch (sortBy) {
      case "price_low":
        sort = {price: 1};
        break;
      case "price_high":
        sort = {price: -1};
        break;
      case "popularity":
        sort = {views: -1};
        break;
      case "newest":
      default:
        sort = {createdAt: -1};
        break;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("seller", "name email")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
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

// Get a specific product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({error: "Invalid product ID"});
    }

    let product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    // Handle invalid category - if category is not a valid ObjectId, set to null
    if (product.category && typeof product.category === "string") {
      product.category = undefined as any;
      await product.save();
    }

    // Now populate after fixing category
    product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({error: "Product not found"});
    }

    // Increment view count (for popularity)
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (err: any) {
    // If error is due to invalid category, try to fix it
    if (err.message && err.message.includes("Cast to ObjectId")) {
      try {
        const product = await Product.findById(id);
        if (product) {
          // Remove invalid category
          product.category = undefined as any;
          await product.save();
          const fixedProduct = await Product.findById(id)
            .populate("category", "name slug")
            .populate("seller", "name email");
          return res.json(fixedProduct);
        }
      } catch (fixErr) {
        // If fix fails, return original error
      }
    }
    res.status(400).json({error: err.message});
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({name: 1});
    res.json(categories);
  } catch (err: any) {
    res.status(400).json({error: err.message});
  }
};
