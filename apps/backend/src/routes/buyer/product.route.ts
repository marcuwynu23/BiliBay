import {Router} from "express";
import {
  getProducts,
  getProductById,
  getCategories,
} from "../../controllers/buyer/product.controller";

const router = Router();

// Get categories
router.get("/categories", getCategories);

// Get all available products
router.get("/", getProducts);

// Get a specific product
router.get("/:id", getProductById);

export default router;
